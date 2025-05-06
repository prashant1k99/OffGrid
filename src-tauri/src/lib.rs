use rusqlite_migration::{Migrations, M};
use std::{fs, sync::Mutex};
use tauri::Manager;

mod docs;
mod models;

use docs::create::create_document;

struct AppState {
    conn: Mutex<rusqlite::Connection>,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// #[tauri::command]
// async fn test(app: AppHandle, _state: tauri::State<'_, AppState>) -> Result<(), String> {
//     let mut path = app.path().local_data_dir().unwrap();
//     path.push("com.off-grid.io");
//     log::info!("base_dir {:?}", path);
//
//     Ok(())
// }

const MIGRATION_SLICE: &[M<'_>] = &[
    M::up(
        "
CREATE TABLE documents (
  id TEXT PRIMARY KEY DEFAULT,
  title TEXT NOT NULL DEFAULT 'Unknown',
  content TEXT,
  is_archived BOOLEAN DEFAULT 0,
  parent_id TEXT REFERENCES documents(id) ON DELETE CASCADE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
",
    ),
    M::up(
        "
CREATE TRIGGER prevent_insert_if_parent_archived
BEFORE INSERT ON documents
FOR EACH ROW
WHEN NEW.parent_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM documents WHERE id = NEW.parent_id AND is_archived = 1
)
BEGIN
    SELECT RAISE(ABORT, 'Cannot create document: parent is archived');
END;
",
    ),
    M::up(
        "
CREATE TRIGGER prevent_unarchive_if_parent_archived
BEFORE UPDATE OF is_archived ON documents
FOR EACH ROW
WHEN NEW.is_archived = 0 AND OLD.is_archived = 1
      AND NEW.parent_id IS NOT NULL
      AND EXISTS (
          SELECT 1 FROM documents
          WHERE id = NEW.parent_id AND is_archived = 1
      )
BEGIN
    SELECT RAISE(ABORT, 'Cannot unarchive: parent document is archived');
END;
",
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
                .unwrap();

            MIGRATIONS.to_latest(&mut conn).unwrap();

            app.manage(AppState {
                conn: Mutex::new(conn),
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet, create_document])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
