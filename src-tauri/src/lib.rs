use std::fs;
use tauri::{AppHandle, Manager};

struct AppState {
    db: libsql::Connection,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn test(app: AppHandle, state: tauri::State<'_, AppState>) -> Result<(), String> {
    let mut path = app.path().local_data_dir().unwrap();
    path.push("com.off-grid.io");
    log::info!("base_dir {:?}", path);

    let conn = state.db.clone();
    let mut rows = conn
        .query(
            "SELECT name FROM sqlite_master WHERE type='table';",
            libsql::params![],
        )
        .await
        .map_err(|e| e.to_string())?;

    log::info!("Rows: {:?}", rows);

    while let Some(row) = rows.next().await.unwrap() {
        log::info!("Row: {:?}", row);
    }

    Ok(())
}

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
            tauri::async_runtime::block_on(async {
                let mut db_path = app.path().local_data_dir().unwrap();
                db_path.push("com.off-grid.io");
                fs::create_dir_all(&db_path).expect("Failed to create database directory");
                db_path.push("off-grid.db");

                let db = libsql::Builder::new_local(db_path)
                    .build()
                    .await
                    .expect("Failed to open DB")
                    .connect()
                    .expect("Unable to connect to database");

                // Run migrations

                app.manage(AppState { db });
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet, test])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
