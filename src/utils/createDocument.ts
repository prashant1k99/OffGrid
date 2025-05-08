import { loadDocs } from "@/state/docs";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";

const createDocument = async (parentId?: string) => {
  try {
    const childId = await invoke("create_document", {
      payload: JSON.stringify({
        parentId
      })
    })
    toast.success("New note created...")
    await loadDocs()
    return childId
  } catch (error) {
    toast.error("Failed to create new note...")
  }
}

export {
  createDocument
}
