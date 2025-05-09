import { Document, list_all_documents } from "@/utils/readDocuments";
import { signal } from "@preact/signals-react";
import Fuse from "fuse.js";

interface TrashState {
  isLoading: Boolean,
  docs: Document[],
  fuse: Fuse<Document> | null
}

const trashState = signal<TrashState>({
  isLoading: false,
  docs: [],
  fuse: null
})

export const loadTrash = async () => {
  trashState.value = {
    ...trashState.value,
    isLoading: true
  }

  try {
    const data = await list_all_documents(true)

    const fuse = new Fuse(
      data,
      {
        keys: ['title', 'content'],
        includeScore: true
      }
    );

    trashState.value = {
      isLoading: false,
      docs: data,
      fuse
    }
  } catch (error) {
    trashState.value = {
      ...trashState.value,
      isLoading: false
    }
    console.log("Failed to load docs: ", error)
  }
}

export default trashState
