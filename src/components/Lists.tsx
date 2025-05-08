import { Key, useEffect, useState } from 'react';
import { Separator } from './ui/separator';
import docsState, { loadDocs } from "../state/docs"
import { useSignalEffect } from '@preact/signals-react';

const Lists = () => {
  const [docs, setDocs] = useState(docsState.value.docs);
  const [isLoading, setIsLoading] = useState(docsState.value.isLoading);

  useSignalEffect(() => {
    if (docsState) {
      setDocs(docsState.value.docs);
      setIsLoading(docsState.value.isLoading);
    }
  })

  useEffect(() => {
    loadDocs()
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
