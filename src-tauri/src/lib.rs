use rusqlite_migration::{Migrations, M};
use std::{fs, sync::Mutex};
use tauri::Manager;

mod docs;
mod models;

use docs::{
    archive::archive_document, create::create_document, list::list_documents,
    search::search_command, update::update_command,
};

struct AppState {
    conn: Mutex<rusqlite::Connection>,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

const MIGRATION_SLICE: &[M<'_>] = &[
    M::up(
        "CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            title TEXT DEFAULT 'Unknown',
            content TEXT,
            is_archived BOOLEAN DEFAULT 0,
            parent_id TEXT REFERENCES documents(id) ON DELETE CASCADE,
            cover_img TEXT,
            icon TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );",
    ),
    M::up(
        "DROP TRIGGER IF EXISTS prevent_insert_if_parent_archived;
        CREATE TRIGGER prevent_insert_if_parent_archived
        BEFORE INSERT ON documents
        FOR EACH ROW
        WHEN NEW.parent_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM documents WHERE id = NEW.parent_id AND is_archived = 1
        )
        BEGIN
            SELECT RAISE(ABORT, 'Cannot create document: parent is archived');
        END;",
    ),
    M::up(
        "CREATE TRIGGER prevent_update_on_archived_docs
        BEFORE UPDATE ON documents
        FOR EACH ROW
        WHEN OLD.is_archived = 1
          AND (
            NEW.title IS NOT OLD.title OR
            NEW.content IS NOT OLD.content OR
            NEW.created_at IS NOT OLD.created_at OR
            NEW.updated_at IS NOT OLD.updated_at
          )
        BEGIN
          SELECT RAISE(ABORT, 'Cannot update archived document except parent_id and is_archived');
        END;",
    ),
    M::up(
        "DROP TRIGGER IF EXISTS unlink_parent_after_unarchive;
        CREATE TRIGGER unlink_parent_after_unarchive
        AFTER UPDATE OF is_archived ON documents
        FOR EACH ROW
        WHEN NEW.is_archived = 0 AND OLD.is_archived = 1
              AND NEW.parent_id IS NOT NULL
              AND EXISTS (
                  SELECT 1 FROM documents
                  WHERE id = NEW.parent_id AND is_archived = 1
              )
        BEGIN
            UPDATE documents
            SET parent_id = NULL
            WHERE id = NEW.id;
        END;",
    ),
    M::up(
        "
    CREATE VIRTUAL TABLE IF NOT EXISTS documents_fts USING fts5(
        id UNINDEXED,
        title,
        content='',
        tokenize = 'porter'
    );
    
    INSERT INTO documents_fts (id, title)
    SELECT id, title FROM documents;

    DROP TRIGGER IF EXISTS documents_ai;
    CREATE TRIGGER documents_ai AFTER INSERT ON documents BEGIN
        INSERT INTO documents_fts (id, title) VALUES (NEW.id, NEW.title);
    END;

    DROP TRIGGER IF EXISTS documents_ad;
    CREATE TRIGGER documents_ad AFTER DELETE ON documents BEGIN
        DELETE FROM documents_fts WHERE id = OLD.id;
    END;

    DROP TRIGGER IF EXISTS documents_au;
    CREATE TRIGGER documents_au AFTER UPDATE ON documents BEGIN
        UPDATE documents_fts SET title = NEW.title WHERE id = NEW.id;
    END;",
    ),
];
const MIGRATIONS: Migrations<'_> = Migrations::from_slice(MIGRATION_SLICE);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let log_config = tauri_plugin_log::Builder::new()
        .target(tauri_plugin_log::Target::new(
            tauri_plugin_log::TargetKind::LogDir {
                file_name: Some("logs".to_string()),
            },
        ))
        .max_file_size(500_000)
        .level(log::LevelFilter::Info)
        .build();

    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(log_config)
        .setup(|app| {
            let mut db_path = app.path().local_data_dir().unwrap();
            db_path.push("com.off-grid.io");
            fs::create_dir_all(&db_path).expect("Failed to create database directory");

            db_path.push("off-grid.db");

            let mut conn = rusqlite::Connection::open(db_path)?;

            conn.pragma_update_and_check(None, "journal_mode", "WAL", |_| Ok(()))
                .expect("Failed to set journal_mode to WAL");

            MIGRATIONS.to_latest(&mut conn).unwrap();

            app.manage(AppState {
                conn: Mutex::new(conn),
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            create_document,
            archive_document,
            list_documents,
            search_command,
            update_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
