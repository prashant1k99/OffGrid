import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";

const deleteDocument = async (docId: string) => {
  try {
    await invoke("delete_command", {
      payload: JSON.stringify({
        docId
      })
    })
    toast.success("Successfully deleted note...")
    return
  } catch (error) {
    console.error(error)
    toast.error("Failed to delete note")
    throw error
  }
}

export {
  deleteDocument
}
