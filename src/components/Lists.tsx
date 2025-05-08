import { useEffect, useState } from 'react';
import { Separator } from './ui/separator';
import docsState, { Document, loadDocs } from "../state/docs"
import { useSignalEffect } from '@preact/signals-react';
import { Item, ItemSkeleton } from './Item';
import { File } from 'lucide-react';
import { useParams } from 'react-router';

const RenderList = ({ parentId, level, docs }: {
  parentId?: string,
  level: number,
  docs: Document[]
}) => {
  const params = useParams();

  const [expanded, setExpanded] = useState(false)

  return docs.map(doc => (
    <div key={doc.id}>
      <Item
        id={doc.id}
        icon={File}
        canExpand={doc.child.length > 0}
        isExpanded={expanded}
        level={level}
        onClick={() => console.log("Open file: ", doc.id)}
        onExpanded={() => setExpanded(!expanded)}
        label={doc.title}
      />
      {(doc.child.length > 0 && expanded) && (
        <RenderList parentId={doc.id} level={level + 1} docs={doc.child} />
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
      <Separator />
      {isLoading ? (
        <div>
          <ItemSkeleton />
          <ItemSkeleton />
          <ItemSkeleton />
        </div>
      ) : (
        <RenderList level={0} docs={docs} />
      )}
    </div>
  )
}

export default Lists
