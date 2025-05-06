use chrono::{NaiveDateTime, Utc};
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

impl CreateDocument {
    pub fn new(title: String) -> Self {
        Self {
            title,
            parent_id: None,
        }
    }

    pub fn parent(&mut self, parent_id: String) {
        self.parent_id = Some(parent_id);
    }
}
