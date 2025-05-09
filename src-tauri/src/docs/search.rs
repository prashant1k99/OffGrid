use std::sync::Mutex;

use rusqlite::{params, Row};
use serde::{Deserialize, Serialize};
use thiserror::Error;

use crate::{models::documents::DocumentList, AppState};

#[derive(Debug, Error)]
pub enum SearchError {
    #[error("Database error: {0}")]
    RusqliteError(String),
    #[error("JSON deserialization error: {0}")]
    JsonError(String),
    #[error("Empty search term not allowed")]
    EmptySearchTerm,
}

impl From<SearchError> for tauri::ipc::InvokeError {
    fn from(value: SearchError) -> Self {
        tauri::ipc::InvokeError::from_error(value)
    }
}

fn db_list_documents(
    db: &Mutex<rusqlite::Connection>,
    filter: &Filters,
) -> Result<Vec<DocumentList>, SearchError> {
    let conn = db.lock().map_err(|_| {
        let err = SearchError::RusqliteError("Failed to acquire DB lock".to_string());
        log::error!("{}", err);
        err
    })?;

    let map_sqlite_err = |e: rusqlite::Error| SearchError::RusqliteError(e.to_string());

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

    let fts_query = format!("\"{}\"", filter.search_term.replace("\"", "\"\""));

    let mut stmt = conn
        .prepare(
            "SELECT d.*
FROM documents d
JOIN documents_fts ON d.id = documents_fts.id
WHERE documents_fts MATCH ?
  AND d.is_archived = ?;",
        )
        .map_err(map_sqlite_err)?;

    let document_iter = stmt
        .query_map(params![&fts_query, filter.is_archived], handle_db_docs)
        .map_err(|e| {
            let err = SearchError::RusqliteError(e.to_string());
            log::error!("{}", err);
            err
        })?;

    let documents = document_iter.filter_map(Result::ok).collect();

    Ok(documents)
}

fn default_is_archive_filter() -> bool {
    false
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Filters {
    search_term: String,
    #[serde(default = "default_is_archive_filter")]
    is_archived: bool,
}

#[tauri::command]
pub fn search_documents(
    state: tauri::State<'_, AppState>,
    payload: String,
) -> Result<Vec<DocumentList>, SearchError> {
    let search_doc_payload: Filters = serde_json::from_str(&payload).map_err(|e| {
        let err = SearchError::JsonError(e.to_string());
        log::error!("Payload:{}, err: {}", payload, err);
        err
    })?;

    if search_doc_payload.search_term.is_empty() {
        return Err(SearchError::EmptySearchTerm);
    }

    db_list_documents(&state.conn, &search_doc_payload)
}
