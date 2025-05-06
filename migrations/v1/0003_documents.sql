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
