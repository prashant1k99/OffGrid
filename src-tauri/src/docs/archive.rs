use std::sync::Mutex;

use tauri::AppHandle;
use thiserror::Error;

use crate::{models::documents::UpdateDocumentArchive, AppState};

#[derive(Debug, Error)]
pub enum ArchiveError {
    #[error("Database error")]
    RusqliteError(String),
    #[error("JSON deserialization error: {0}")]
    JsonError(String),
}

impl From<ArchiveError> for tauri::ipc::InvokeError {
    fn from(value: ArchiveError) -> Self {
        tauri::ipc::InvokeError::from_error(value)
    }
}

fn db_archive_doc(
    db: &Mutex<rusqlite::Connection>,
    doc: UpdateDocumentArchive,
) -> Result<(), ArchiveError> {
    let conn = db.lock().map_err(|_| {
        let err = ArchiveError::RusqliteError("Failed to acquire DB lock".to_string());
        log::error!("{}", err);
        err
    })?;

    // Keep on running setting the is_archived
    let document = conn
        .execute(
            "
WITH RECURSIVE descendants(id) AS (
  SELECT id FROM documents WHERE id = ?
  UNION ALL
  SELECT d.id
  FROM documents d
  INNER JOIN descendants ds ON d.parent_id = ds.id
)
UPDATE documents
SET is_archived = ?
WHERE id IN (SELECT id FROM descendants);
                ",
            (doc.id, doc.is_archived),
        )
        .map_err(|e| {
            let err = ArchiveError::RusqliteError(e.to_string());
            log::error!("Operation: 'set_is_archive' err: {}", err);
            err
        })?;

    println!("Effected Rows: {}", document);

    Ok(())
}

#[tauri::command]
pub fn archive_document(
    _app: AppHandle,
    state: tauri::State<'_, AppState>,
    payload: String,
) -> Result<(), ArchiveError> {
    let create_doc_payload: UpdateDocumentArchive =
        serde_json::from_str(&payload).map_err(|e| {
            let err = ArchiveError::JsonError(e.to_string());
            log::error!("Payload:{}, err: {}", payload, err);
            err
        })?;

    db_archive_doc(&state.conn, create_doc_payload)
}
