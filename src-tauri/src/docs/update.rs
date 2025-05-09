use std::sync::Mutex;

use rusqlite::params;
use tauri::AppHandle;
use thiserror::Error;

use crate::{models::documents::UpdateDocument, AppState};

#[derive(Debug, Error)]
pub enum UpdateError {
    #[error("Database error: {0}")]
    RusqliteError(String),
    #[error("JSON deserialization error: {0}")]
    JsonError(String),
}

impl From<UpdateError> for tauri::ipc::InvokeError {
    fn from(value: UpdateError) -> Self {
        tauri::ipc::InvokeError::from_error(value)
    }
}

fn db_list_documents(
    db: &Mutex<rusqlite::Connection>,
    update_payload: &UpdateDocument,
) -> Result<(), UpdateError> {
    let conn = db.lock().map_err(|_| {
        let err = UpdateError::RusqliteError("Failed to acquire DB lock".to_string());
        log::error!("{}", err);
        err
    })?;

    // Write query to update the document
    conn.execute(
        "
        UPDATE documents
        SET
            title = CASE WHEN title <> ?1 THEN ?1 ELSE title END,
            content = CASE WHEN content <> ?2 THEN ?2 ELSE content END,
            parent_id = CASE WHEN parent_id <> ?3 THEN ?3 ELSE parent_id END,
            icon = CASE WHEN icon <> ?4 THEN ?4 icon END,
            cover_img = CASE WHEN cover_img <> ?5 THEN ?5 cover_img END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?6
        ",
        params![
            update_payload.title,
            update_payload.content,
            update_payload.parent_id,
            update_payload.icon,
            update_payload.cover_img,
            update_payload.id
        ],
    )
    .map_err(|e| {
        let err = UpdateError::RusqliteError(e.to_string());
        log::error!("{}", err);
        err
    })?;

    Ok(())
}

#[tauri::command]
pub fn update_command(
    state: tauri::State<'_, AppState>,
    payload: String,
) -> Result<(), UpdateError> {
    let update_doc_payload: UpdateDocument = serde_json::from_str(&payload).map_err(|e| {
        let err = UpdateError::JsonError(e.to_string());
        log::error!("Payload:{}, err: {}", payload, err);
        err
    })?;

    db_list_documents(&state.conn, &update_doc_payload)
}
