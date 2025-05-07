use std::sync::Mutex;

use rusqlite::{params, Row};
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
    parent_id: Option<&str>,
) -> Result<Vec<DocumentList>, ListError> {
    let conn = db.lock().map_err(|_| {
        let err = ListError::RusqliteError("Failed to acquire DB lock".to_string());
        log::error!("{}", err);
        err
    })?;

    let (sql, param) = match parent_id {
        Some(id) => (
            "SELECT * FROM documents WHERE parent_id = ? ORDER BY updated_at DESC;",
            params![id.to_string()],
        ),
        None => (
            "SELECT * FROM documents WHERE parent_id IS NULL ORDER BY updated_at DESC",
            params![],
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
    doc_id: Option<&str>,
) -> Result<Vec<DocumentListWithChild>, ListError> {
    let docs = db_list_documents(db, doc_id)?;
    let docs_with_child: Vec<DocumentListWithChild> = docs
        .into_iter()
        .flat_map(
            |doc_list_item| -> Result<DocumentListWithChild, ListError> {
                let mut doc_with_child: DocumentListWithChild = doc_list_item.into();

                let children = fetch_doc_children(db, Some(&doc_with_child.id))?;
                doc_with_child.child = Box::new(Some(children));
                Ok(doc_with_child)
            },
        )
        .collect();

    Ok(docs_with_child)
}

#[tauri::command]
pub fn list_documents(
    _app: AppHandle,
    state: tauri::State<'_, AppState>,
) -> Result<Vec<DocumentListWithChild>, ListError> {
    fetch_doc_children(&state.conn, None)
}
