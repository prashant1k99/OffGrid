import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";
import { Document } from "./readDocuments";

const searchDocuments = async (searchTerm: string, fromArchive = false) => {
  try {
    const docs = await invoke("search_documents", {
      payload: JSON.stringify({
        searchTerm,
        isArchived: fromArchive
      })
    })
    return docs as Document[]
  } catch (error) {
    toast.error("Failed to search document")
    throw error
  }
}

export {
  searchDocuments,
}
