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
import { useEffect, useState } from "react"
import ItemOption from "./ItemOptions"
import { Search } from "lucide-react"

interface GlobalSearchProps {
  open: boolean,
  onOpenChange: (state: boolean) => void
}

const GlobalSearch = ({ open: openProp, onOpenChange }: GlobalSearchProps) => {
  const [open, setOpen] = useState(openProp)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  useEffect(() => {
    onOpenChange(open)
  }, [open])

  return (
    <>
      <ItemOption onClick={() => {
        console.log("Search")
      }} label="Search" icon={Search} isSearch />
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            Prashant
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}

export default GlobalSearch
