use std::sync::Mutex;

use rusqlite::{params, Row};
use serde::{Deserialize, Serialize};
use tauri::AppHandle;
use thiserror::Error;

use crate::{
    models::documents::{DocumentList, DocumentListWithChild},
    AppState,
};

#[derive(Debug, Error)]
pub enum ListError {
    #[error("Database error: {0}")]
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
    filter: &Filters,
) -> Result<Vec<DocumentList>, ListError> {
    let conn = db.lock().map_err(|_| {
        let err = ListError::RusqliteError("Failed to acquire DB lock".to_string());
        log::error!("{}", err);
        err
    })?;

    let (sql, param) = match &filter.parent_id {
        Some(id) => (
            "SELECT * FROM documents WHERE parent_id = ? AND is_archived = ? ORDER BY updated_at DESC;",
            params![id.to_string(), filter.is_archived],
        ),
        None => (
            "SELECT * FROM documents WHERE parent_id IS NULL AND is_archived = ? ORDER BY updated_at DESC",
            params![filter.is_archived],
        ),
    };

    let mut stmt = conn
        .prepare(sql)
        .map_err(|e| ListError::RusqliteError(e.to_string()))?;

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
        .query_map(param, handle_db_docs)
        .map_err(|e| ListError::RusqliteError(e.to_string()))?;

    let documents = document_iter.filter_map(Result::ok).collect();

    Ok(documents)
}

pub fn fetch_doc_children(
    db: &Mutex<rusqlite::Connection>,
    filters: Filters,
) -> Result<Vec<DocumentListWithChild>, ListError> {
    let docs = db_list_documents(db, &filters)?;

    let docs_with_child: Vec<DocumentListWithChild> = docs
        .into_iter()
        .flat_map(
            move |doc_list_item| -> Result<DocumentListWithChild, ListError> {
                let mut doc_with_child: DocumentListWithChild = doc_list_item.into();

                let children = fetch_doc_children(
                    db,
                    Filters {
                        parent_id: Some(doc_with_child.id.clone()),
                        is_archived: filters.is_archived,
                    },
                )?;
                doc_with_child.child = Box::new(Some(children));
                Ok(doc_with_child)
            },
        )
        .collect();

    Ok(docs_with_child)
}

fn default_is_archive_filter() -> bool {
    false
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Filters {
    parent_id: Option<String>,
    #[serde(default = "default_is_archive_filter")]
    is_archived: bool,
}

#[tauri::command]
pub fn list_documents(
    _app: AppHandle,
    state: tauri::State<'_, AppState>,
    payload: String,
) -> Result<Vec<DocumentListWithChild>, ListError> {
    let list_docs_payload: Filters = serde_json::from_str(&payload).map_err(|e| {
        let err = ListError::JsonError(e.to_string());
        log::error!("Payload:{}, err: {}", payload, err);
        err
    })?;

    // This also prevents circular dependency, so if a doc has parent_id and that parent has the
    // child doc_id, the entire thread won't be picked
    fetch_doc_children(&state.conn, list_docs_payload)
}
