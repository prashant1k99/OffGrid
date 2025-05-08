use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Document {
    pub id: String,
    pub title: String,
    pub is_archived: bool,
    pub parent_id: Option<String>,
    pub content: Option<String>,
    pub cover_img: Option<String>,
    pub icon: Option<String>,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

fn default_title() -> Option<String> {
    Some("Unknown".to_string())
}
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateDocument {
    #[serde(default = "default_title")]
    pub title: Option<String>,
    pub parent_id: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateDocument {
    pub id: String,
    pub title: Option<String>,
    pub parent_id: Option<String>,
    pub content: Option<String>,
    pub cover_img: Option<String>,
    pub icon: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateDocumentArchive {
    pub id: String,
    pub is_archived: bool,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DocumentList {
    pub id: String,
    pub title: String,
    pub is_archived: bool,
    pub parent_id: Option<String>,
    pub icon: Option<String>,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DocumentListWithChild {
    pub id: String,
    pub title: String,
    pub is_archived: bool,
    pub child: Box<Option<Vec<DocumentListWithChild>>>,
    pub icon: Option<String>,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

impl From<DocumentList> for DocumentListWithChild {
    fn from(value: DocumentList) -> Self {
        Self {
            id: value.id,
            title: value.title,
            is_archived: value.is_archived,
            icon: value.icon,
            created_at: value.created_at,
            updated_at: value.updated_at,
            child: Box::new(None),
        }
    }
}
