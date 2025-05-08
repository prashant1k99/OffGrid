import { useEffect, useState } from 'react';
import docsState, { Document, loadDocs } from "../state/docs"
import { useSignalEffect } from '@preact/signals-react';
import { ListItem, ListItemSkeleton } from './ListItem';
import { File } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { createDocument } from '@/utils/createDocument';
import { archiveDocument } from '@/utils/archiveDocuments';

const RenderList = ({ level, docs }: {
  level: number,
  docs: Document[],
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

  const createChild = (parentId: string) => {
    createDocument(parentId)
      .then(childValue => {
        const child = childValue as Document;
        onExpand(parentId, true)
        navigate(`/documents/${child.id}`)
      })
  }

  const archiveDoc = (docId: string) => {
    archiveDocument(docId).then(() => {
      navigate("/")
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
          navigate(`/documents/${doc.id}`)
        }}
        onCreateChild={() => {
          createChild(doc.id)
        }}
        onArchive={() => {
          archiveDoc(doc.id)
        }}
        onExpanded={() => onExpand(doc.id)}
        label={doc.title}
      />
      {(doc.child.length > 0 && expanded[doc.id]) && (
        <RenderList level={level + 1} docs={doc.child} />
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
      ) :
        docs.length == 0 ? (
          <div className='p-1.5 px-2.5 text-muted-foreground text-sm'>No Notes found</div>
        ) : (
          <RenderList level={0} docs={docs} />
        )
      }
    </div>
  )
}

export default Lists
