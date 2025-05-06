CREATE TRIGGER prevent_insert_if_parent_archived
BEFORE INSERT ON documents
FOR EACH ROW
WHEN NEW.parent_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM documents WHERE id = NEW.parent_id AND is_archived = 1
)
BEGIN
    SELECT RAISE(ABORT, 'Cannot create document: parent is archived');
END;
