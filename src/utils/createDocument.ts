import { loadDocs } from "@/state/docs";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";

const createDocument = async () => {
  const promise = invoke("create_document", { payload: JSON.stringify({}) })
  toast.promise(promise, {
    loading: "Creating a new note...",
    success: (data) => {
      console.log(data)
      return "New note created";
    },
    error: 'Failed to create a new note'
  })
  loadDocs()
}

export {
  createDocument
}
