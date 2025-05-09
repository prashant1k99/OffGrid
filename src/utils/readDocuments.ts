import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";

export type PopulatedDocument = {
  id: string,
  title: string,
  child: PopulatedDocument[],
  icon?: string,
  isArchived: boolean,
  createdAt: string,
  updatedAt: string
}

const list_documents_populated = async (fromArchive = false): Promise<PopulatedDocument[]> => {
  try {
    const docs = await invoke("list_documents", {
      payload: JSON.stringify({
        isArchived: fromArchive
      })
    })
    return docs as PopulatedDocument[]
  } catch (error) {
    console.error(error)
    toast.error("Failed to create new note...")
    throw error
  }
}

export type Document = Omit<PopulatedDocument, 'child'> & {
  parentId?: string
}

const list_all_documents = async (fromArchive = false) => {
  console.log("Passed archive: ", fromArchive)
  try {
    const docs = await invoke("simple_list_documents", {
      payload: JSON.stringify({
        isArchived: fromArchive
      })
    })
    return docs as Document[]
  } catch (error) {
    console.error(error)
    toast.error("Failed to create new note...")
    throw error
  }
}

export {
  list_documents_populated,
  list_all_documents
}
