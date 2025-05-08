import { useEffect, useState } from 'react';
import docsState, { Document, loadDocs } from "../state/docs"
import { useSignalEffect } from '@preact/signals-react';
import { ListItem, ListItemSkeleton } from './ListItem';
import { File } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { createDocument } from '@/utils/createDocument';

const RenderList = ({ level, docs, redirectPath }: {
  level: number,
  docs: Document[],
  redirectPath: string
}) => {
  const params = useParams();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const onExpand = (documentId: string, setTo?: boolean) => {
    setExpanded(prevExpanded => ({
      ...prevExpanded,
      [documentId]: setTo ?? !prevExpanded[documentId]
    }))
  }

  const createChild = (parentId: string, redirectPath: string) => {
    createDocument(parentId)
      .then((childId) => {
        onExpand(parentId, true)
        navigate(`/documents/${redirectPath}/${childId}`)
      })
  }

  return docs.map(doc => (
    <div key={doc.id}>
      <ListItem
        id={doc.id}
        icon={File}
        canExpand={doc.child.length > 0}
        isExpanded={expanded[doc.id]}
        isActive={params.docId == doc.id}
        level={level}
        onClick={() => {
          navigate(`/documents/${redirectPath}/${doc.id}`)
        }}
        onCreateChild={() => {
          createChild(doc.id, `${redirectPath}+${doc.id}`)
        }}
        onExpanded={() => onExpand(doc.id)}
        label={doc.title}
      />
      {(doc.child.length > 0 && expanded[doc.id]) && (
        <RenderList level={level + 1} docs={doc.child} redirectPath={`${redirectPath}+${doc.id}`} />
      )}
    </div>
  ))
}

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
      {isLoading ? (
        <div>
          <ListItemSkeleton />
          <ListItemSkeleton />
          <ListItemSkeleton />
        </div>
      ) : (
        <RenderList level={0} docs={docs} redirectPath="0" />
      )}
    </div>
  )
}

export default Lists
