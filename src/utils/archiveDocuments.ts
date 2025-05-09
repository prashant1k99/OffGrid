import { loadDocs } from "@/state/docs";
import { loadTrash } from "@/state/trash";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";

const archiveDocument = async (docId: string) => {
  try {
    await invoke("archive_document", {
      payload: JSON.stringify({
        id: docId,
        isArchived: true
      })
    })
    toast.success("Successfully archived...")
    await loadDocs()
    await loadTrash()
    return
  } catch (error) {
    toast.error("Failed to archive document")
    throw error
  }
}

const restoreDocumnet = async (docId: string) => {
  try {
    await invoke("archive_document", {
      payload: JSON.stringify({
        id: docId,
        isArchived: false
      })
    })
    toast.success("Successfully restored notes...")
    await loadDocs()
    await loadTrash()
    return
  } catch (error) {
    console.log(error)
    toast.error("Failed to restore note")
    throw error
  }
}

export {
  archiveDocument,
  restoreDocumnet
}
