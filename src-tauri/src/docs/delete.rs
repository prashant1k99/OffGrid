use std::sync::Mutex;

use rusqlite::params;
use thiserror::Error;

use crate::AppState;

#[derive(Debug, Error)]
pub enum DeleteError {
    #[error("Database error: {0}")]
    RusqliteError(String),
    #[error("JSON deserialization error: {0}")]
    JsonError(String),
}

impl From<DeleteError> for tauri::ipc::InvokeError {
    fn from(value: DeleteError) -> Self {
        tauri::ipc::InvokeError::from_error(value)
    }
}

fn db_delete_document(db: &Mutex<rusqlite::Connection>, doc_id: String) -> Result<(), DeleteError> {
    let conn = db.lock().map_err(|_| {
        let err = DeleteError::RusqliteError("Failed to acquire DB lock".to_string());
        log::error!("{}", err);
        err
    })?;

    conn.execute(
        "
DELETE FROM documents
WHERE id = ? AND is_archived = 1;
",
        params![doc_id],
    )
    .map_err(|e| {
        let err = DeleteError::RusqliteError(e.to_string());
        log::error!("{}", err);
        err
    })?;

    Ok(())
}

#[tauri::command]
pub fn delete_command(
    state: tauri::State<'_, AppState>,
    doc_id: String,
) -> Result<(), DeleteError> {
    db_delete_document(&state.conn, doc_id)
}
