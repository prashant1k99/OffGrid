-- Create documents table
CREATE TABLE documents (
  id TEXT PRIMARY KEY DEFAULT (uuid()),
  title TEXT NOT NULL DEFAULT 'Unknown',
  content TEXT,
  is_archived BOOLEAN DEFAULT 0,
  parent_id TEXT REFERENCES documents(id) ON DELETE CASCADE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Prevent document creation if parent is archived
CREATE TRIGGER prevent_insert_if_parent_archived
BEFORE INSERT ON documents
FOR EACH ROW
WHEN NEW.parent_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM documents WHERE id = NEW.parent_id AND is_archived = 1
)
BEGIN
    SELECT RAISE(ABORT, 'Cannot create document: parent is archived');
END;

-- Prevent unarchiving child if parent is archived
CREATE TRIGGER prevent_unarchive_if_parent_archived
BEFORE UPDATE OF is_archived ON documents
FOR EACH ROW
WHEN NEW.is_archived = 0 AND OLD.is_archived = 1
      AND NEW.parent_id IS NOT NULL
      AND EXISTS (
          SELECT 1 FROM documents
          WHERE id = NEW.parent_id AND is_archived = 1
      )
BEGIN
    SELECT RAISE(ABORT, 'Cannot unarchive: parent document is archived');
END;
