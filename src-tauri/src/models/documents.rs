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

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateDocument {
    pub title: String,
    pub parent_id: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateDocument {
    pub title: Option<String>,
    pub is_archived: Option<String>,
    pub parent_id: Option<String>,
    pub content: Option<String>,
    pub cover_img: Option<String>,
    pub icon: Option<String>,
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
