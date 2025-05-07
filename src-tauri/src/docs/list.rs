use std::sync::Mutex;

use rusqlite::{params, Row};
use tauri::AppHandle;
use thiserror::Error;

use crate::{
    models::{
        documents::DocumentList,
        pagination::{Pagination, SortOrder},
    },
    AppState,
};

#[derive(Debug, Error)]
pub enum ListError {
    #[error("Database error")]
    RusqliteError(String),
    #[error("JSON deserialization error: {0}")]
    JsonError(String),
}

impl From<ListError> for tauri::ipc::InvokeError {
    fn from(value: ListError) -> Self {
        tauri::ipc::InvokeError::from_error(value)
    }
}

fn db_list_documents(
    db: &Mutex<rusqlite::Connection>,
    pagination_info: &Pagination,
) -> Result<Vec<DocumentList>, ListError> {
    let conn = db.lock().map_err(|_| {
        let err = ListError::RusqliteError("Failed to acquire DB lock".to_string());
        log::error!("{}", err);
        err
    })?;

    let sort_by = pagination_info
        .sort_by
        .clone()
        .unwrap_or_else(|| "created_at".to_string()); // Default sort field

    let sort_order = match pagination_info.sort_order {
        Some(SortOrder::Desc) => "DESC",
        _ => "ASC", // Default order
    };
    let sql = format!(
        "SELECT * FROM documents WHERE parent_id IS NULL ORDER BY {} {} LIMIT ? OFFSET ?",
        sort_by, sort_order
    );
    let mut stmt = conn
        .prepare(&sql)
        .map_err(|e| ListError::RusqliteError(e.to_string()))?;

    let pagination_offset = pagination_info.page.unwrap() * pagination_info.limit.unwrap();

    fn handle_db_docs(row: &Row) -> Result<DocumentList, rusqlite::Error> {
        Ok(DocumentList {
            id: row.get("id")?,
            title: row.get("title")?,
            is_archived: row.get("is_archived")?,
            parent_id: row.get("parent_id")?,
            icon: row.get("icon")?,
            created_at: row.get("created_at")?,
            updated_at: row.get("updated_at")?,
        })
    }

    let document_iter = stmt
        .query_map(
            params![pagination_info.limit, pagination_offset],
            handle_db_docs,
        )
        .map_err(|e| ListError::RusqliteError(e.to_string()))?;

    let documents = document_iter.filter_map(Result::ok).collect();

    Ok(documents)
}

#[tauri::command]
pub fn list_documents(
    _app: AppHandle,
    state: tauri::State<'_, AppState>,
    payload: String,
) -> Result<Vec<DocumentList>, ListError> {
    let list_pagination_info: Pagination = serde_json::from_str(&payload).map_err(|e| {
        let err = ListError::JsonError(e.to_string());
        log::error!("Payload:{}, err: {}", payload, err);
        err
    })?;

    db_list_documents(&state.conn, &list_pagination_info)
}
