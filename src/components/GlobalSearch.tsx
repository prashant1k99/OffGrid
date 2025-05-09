import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { useCallback, useEffect, useState } from "react"
import ItemOption from "./ItemOptions"
import { File, PlusCircle, Search, Settings } from "lucide-react"
import { platform } from '@tauri-apps/plugin-os';
import { useNavigate } from "react-router";
import { createDocument } from "@/utils/createDocument";
import { Document } from "@/utils/readDocuments";
import debounce from "@/utils/debounce";
import { searchDocuments } from "@/utils/searchDocuments";

interface GlobalSearchProps {
  open: boolean,
  onOpenChange: (state: boolean) => void
}

enum SearchResultType {
  Notes
}

interface SearchResult {
  id: string,
  icon?: string,
  title?: string,
  type: SearchResultType
}

const GlobalSearch = ({ open: openProp, onOpenChange }: GlobalSearchProps) => {
  const navigator = useNavigate()

  const [open, setOpen] = useState(openProp)
  const [search, setSearch] = useState("")

  const [results, setResults] = useState<SearchResult[]>([])

  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    onOpenChange(open)
    setSearch("")
  }, [open])

  const debouncedSearch = useCallback(debounce(async (searchTerm: string) => {
    if (searchTerm != "") {
      const docs = (await searchDocuments(searchTerm)).map((doc) => {
        return {
          id: doc.id,
          type: SearchResultType.Notes,
          title: doc.title,
          icon: doc.icon
        }
      }) as SearchResult[]
      setResults(docs)
    } else {
      setResults([])
    }
    setIsLoading(false)
  }, 2000), [setResults])

  useEffect(() => {
    setIsLoading(true)
    debouncedSearch(search)
    // Use debounce
  }, [search])

  const onCreateNewNote = (withTitle = false) => {
    setIsLoading(true)
    let title = withTitle ? search : undefined
    createDocument({
      title
    }).then((doc: unknown) => {
      let document = doc as Document
      navigator(`/documents/${document.id}`)
      setOpen(false)
    }).finally(() => setIsLoading(false))
  }

  const onSelect = (id: string) => {
    navigator(`/documents/${id}`)
    setOpen(false)
  }

  useEffect(() => {
    const isMacOs = platform() == "macos"
    const down = (e: KeyboardEvent) => {
      if ((isMacOs ? e.metaKey : e.ctrlKey) && e.key == "k") {
        e.preventDefault()
        setOpen((open) => !open)
      } else if ((isMacOs ? e.metaKey : e.ctrlKey) && e.key == "n") {
        e.preventDefault()
        onCreateNewNote()
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <>
      <ItemOption onClick={() => setOpen(true)} label="Search" icon={Search} shortcutKey="K" />
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput value={search} onValueChange={(val) => { setSearch(val) }} placeholder="Type a command or search notes..." />
        {isLoading && <div className="h-0.5 w-full loader-bar border-0" />}
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandSeparator />
          {
            search != "" && (
              <CommandGroup heading='Documents'>
                {results.length > 0 &&
                  results?.map(document => (
                    <CommandItem
                      key={document.id}
                      value={`${document.id}-${document.title}`}
                      title={document.title}
                      onSelect={() => onSelect(document.id)}
                    >
                      {document.icon ? (
                        <p className="mr-2 text-[18px]">
                          {document.icon}
                        </p>
                      ) : (
                        <File className="w-4 h-4 mr-2" />
                      )}
                      <span>
                        {document.title}
                      </span>
                    </CommandItem>
                  ))
                }
                <CommandItem onSelect={() => onCreateNewNote(true)} onClick={() => onCreateNewNote()}>
                  <File className="w-4 h-4 mr-2" />
                  {search} - <span className="font-bold">
                    Create New Note
                  </span>
                </CommandItem>
              </CommandGroup>
            )
          }
          <CommandGroup heading="Suggestions">
            <CommandItem onSelect={() => onCreateNewNote()} onClick={() => onCreateNewNote()}>
              <PlusCircle />
              <span>New Note</span>
              <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Settings />
              <span>Settings</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}

export default GlobalSearch
