import { signal } from "@preact/signals-react";
import { invoke } from "@tauri-apps/api/core";

export type Document = {
  id: string,
  title: string,
  child: Document[],
  icon?: string,
  isArchived: boolean,
  createdAt: string,
  updatedAt: string
}

interface DocsState {
  isLoading: Boolean,
  docs: Document[]
}

const docsState = signal<DocsState>({
  isLoading: false,
  docs: []
})

export const loadDocs = async () => {
  docsState.value.isLoading = true

  try {
    const data = await invoke("list_documents", {
      payload: JSON.stringify({
        isArchived: false
      })
    }) as Document[]
    docsState.value = {
      isLoading: false,
      docs: data
    }
  } catch (error) {
    docsState.value.isLoading = false
    console.log("Failed to load docs: ", error)
  }
}

export default docsState
