import { Search, Trash, Trash2, Undo } from "lucide-react";
import ItemOption from "./ItemOptions";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "./ui/input";
import { MouseEvent as ReactMouseEvent, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";
import { Document } from "@/utils/readDocuments";
import ConfirmModal from "./ConfirmModal";
import { useSignalEffect } from "@preact/signals-react";
import trashState, { loadTrash } from "@/state/trash";
import Fuse from "fuse.js";
import { useNavigate } from "react-router";
import { deleteDocument } from "@/utils/deleteDocument";
import { restoreDocumnet } from "@/utils/archiveDocuments";
import { ScrollArea } from "./ui/scroll-area";

interface TrashItemsProps {
  document: Document,
  onClick: (id: string) => void,
  onRestore: (e: ReactMouseEvent<HTMLDivElement, MouseEvent>, id: string) => void,
  onRemove: (id: string) => void
}

const TrashItems = ({ document, onClick, onRemove, onRestore }: TrashItemsProps) => {
  return (
    <div className="text-sm rounded-sm w-full hover:bg-primary/5 flex justify-between items-center text-primary"
    >
      <span role="button" className="truncate pl-2 cursor-pointer" onClick={() => onClick(document.id)}>
        {document.title}
      </span>
      <div className="flex items-center">
        <div className="rounded-sm p-2 hover:bg-neutral-200 
              dark:hover:bg-neutral-600" onClick={e => onRestore(e, document.id)}>
          <Undo className="w-3 h-3 cursor-pointer text-muted-foreground" />
        </div>
        <ConfirmModal title="Delete Note" description="This will permanently delete note and this action cannot be reverted once done..." onConfirm={() => onRemove(document.id)}>
          <div className="rounded-sm p-2 hover:bg-neutral-200
                dark:hover:bg-neutral-600" role="button">
            <Trash className="w-4 h-4 cursor-pointer text-muted-foreground" />
          </div>
        </ConfirmModal>
      </div>
    </div>
  )
}

const TrashItemsSkeleton = () => {
  return (
    <div
      style={{ paddingLeft: "12px" }}
      className="flex gap-2 py-1"
    >
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-4 w-[60%]" />
    </div>
  )
}

const TrashPopup = () => {
  const navigator = useNavigate()

  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(trashState.value.isLoading);
  const [searcher, setSearcher] = useState<Fuse<Document> | null>(trashState.value.fuse);

  const [docs, setDocs] = useState<Document[]>([])

  useSignalEffect(() => {
    setIsLoading(trashState.value.isLoading)
    setDocs(trashState.value.docs)
    setSearcher(trashState.value.fuse)
  })

  useEffect(() => {
    loadTrash()
  }, [])

  useEffect(() => {
    if (search != "") {
      const docs = searcher?.search(search).map(doc => doc.item) as Document[]
      setDocs(docs)
    } else {
      setDocs(trashState.value.docs)
    }
  }, [search])

  const permanatlyDelete = (docId: string) => {
    deleteDocument(docId)
  }

  const restoreItem = (_e: any, docId: string) => {
    restoreDocumnet(docId)
    navigator(`/archived/${docId}`)
    setOpen(false)
  }

  const openArchivedDoc = (docId: string) => {
    navigator(`/archived/${docId}`)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="w-full">
        <ItemOption
          label="Trash"
          icon={Trash2}
          onClick={() => console.log("Do trash")}
        />
      </PopoverTrigger>
      <PopoverContent
        className="p-0 pb-3 w-96 h-[400px] flex flex-col"
        side={"right"}
      >
        <div className="text-sm p-2">
          <div
            className={cn(
              "flex items-center gap-x-1",
            )}
          >
            <Search className="w-4 h-4" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-7 px-2 focus-visible:ring-transparent bg-secondary rounded"
              placeholder="Filter by page title..."
            />
          </div>
          {isLoading && (
            <div className="h-0.5 w-full loader-bar" />
          )}
        </div>
        <div className="mt-2 px-1 pb-1 h-full">
          {isLoading ? (
            <>
              <TrashItemsSkeleton />
              <TrashItemsSkeleton />
              <TrashItemsSkeleton />
            </>
          ) : (
            <ScrollArea className="h-full">
              <div>
                {
                  docs.length == 0 ? (
                    <p className="hidden last:block text-xs text-center text-muted-foreground pb-2">
                      No documents found
                    </p>
                  ) : docs.map(doc => (
                    <TrashItems
                      key={doc.id}
                      document={doc}
                      onClick={openArchivedDoc}
                      onRemove={permanatlyDelete}
                      onRestore={restoreItem}
                    />
                  ))
                }
              </div>
            </ScrollArea>
          )
          }
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default TrashPopup;
