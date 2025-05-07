use serde::{Deserialize, Serialize};

fn default_page() -> Option<u8> {
    Some(0)
}

fn default_limit() -> Option<u8> {
    Some(20)
}

#[derive(Debug, Deserialize, Serialize)]
pub enum SortOrder {
    Asc,
    Desc,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Pagination {
    #[serde(default = "default_page")]
    pub page: Option<u8>,
    #[serde(default = "default_limit")]
    pub limit: Option<u8>,
    pub sort_by: Option<String>,
    pub sort_order: Option<SortOrder>,
}
