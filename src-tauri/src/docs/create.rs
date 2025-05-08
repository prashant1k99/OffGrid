use std::sync::Mutex;

use tauri::AppHandle;
use thiserror::Error;
use uuid::Uuid;

use crate::{
    models::documents::{CreateDocument, Document},
    AppState,
};

#[derive(Debug, Error)]
pub enum CreateError {
    #[error("Database error")]
    RusqliteError(String),
    #[error("JSON deserialization error: {0}")]
    JsonError(String),
}

impl From<CreateError> for tauri::ipc::InvokeError {
    fn from(value: CreateError) -> Self {
        tauri::ipc::InvokeError::from_error(value)
    }
}

fn db_create_document(
    db: &Mutex<rusqlite::Connection>,
    doc: CreateDocument,
) -> Result<Document, CreateError> {
    let conn = db.lock().map_err(|_| {
        let err = CreateError::RusqliteError("Failed to acquire DB lock".to_string());
        log::error!("{}", err);
        err
    })?;

    let new_id = Uuid::new_v4().to_string();

    let document = conn
        .query_row_and_then(
            "INSERT INTO documents (id, title, parent_id) VALUES (?, ?, ?) RETURNING *;",
            (new_id, doc.title, doc.parent_id),
            |row| -> rusqlite::Result<Document> {
                Ok(Document {
                    id: row.get("id")?,
                    title: row.get("title")?,
                    is_archived: row.get("is_archived")?,
                    parent_id: row.get("parent_id")?,
                    content: row.get("content")?,
                    cover_img: row.get("cover_img")?,
                    icon: row.get("icon")?,
                    created_at: row.get("created_at")?,
                    updated_at: row.get("updated_at")?,
                })
            },
        )
        .map_err(|e| {
            println!("Error: {:?}", e);
            let err = CreateError::RusqliteError(e.to_string());
            log::error!("err: {}", err);
            err
        })?;

    Ok(document)
}

#[tauri::command]
pub fn create_document(
    _app: AppHandle,
    state: tauri::State<'_, AppState>,
    payload: String,
) -> Result<Document, CreateError> {
    println!("Payload: {payload}");
    let create_doc_payload: CreateDocument = serde_json::from_str(&payload).map_err(|e| {
        let err = CreateError::JsonError(e.to_string());
        log::error!("Payload:{}, err: {}", payload, err);
        err
    })?;

    println!("Payload {:#?}", create_doc_payload);

    db_create_document(&state.conn, create_doc_payload)
}
