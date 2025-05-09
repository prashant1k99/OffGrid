import { loadDocs } from "@/state/docs";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";

const createDocument = async (title?: string, parentId?: string) => {
  try {
    const docId = await invoke("create_document", {
      payload: JSON.stringify({
        title,
        parentId
      })
    })
    toast.success("New note created...")
    await loadDocs()
    return docId
  } catch (error) {
    console.error(error)
    toast.error("Failed to create new note...")
    throw error
  }
}

export {
  createDocument
}
