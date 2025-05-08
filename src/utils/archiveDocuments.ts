import { loadDocs } from "@/state/docs";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";

const archiveDocument = async (docId: string) => {
  try {
    const childId = await invoke("archive_document", {
      payload: JSON.stringify({
        id: docId,
        isArchived: true
      })
    })
    toast.success("Successfully archived...")
    await loadDocs()
    return childId
  } catch (error) {
    toast.error("Failed to archive document")
  }
}

export {
  archiveDocument
}
