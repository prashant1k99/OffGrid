import { invoke } from '@tauri-apps/api/core';
import { Key, useEffect, useState } from 'react';
import { Separator } from './ui/separator';

type Docs = {
  id: String,
  title: String,
  child?: Docs[],
  icon?: String,
  isArchived: boolean,
  createdAt: String,
  updatedAt: String
}

const Lists = () => {
  const [docs, setDocs] = useState<Docs[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true)
    try {
      const data = await invoke("list_documents", { payload: JSON.stringify({}) })
      console.log(data)
      setDocs(data as Docs[])
    } catch (error) {
      console.log("Err: ", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])


  return (
    <div>
      <Separator />
      <div>
        List Items
      </div>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        docs.map(doc => (
          <p key={doc.id as Key}>{doc.title}</p>
        ))
      )}
    </div>
  )
}

export default Lists
