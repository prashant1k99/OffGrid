import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, LucideIcon, Plus, Trash } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "./ui/button";
import { useState } from "react";

interface ItemProps {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  onExpanded: () => void,
  onCreateChild: () => void,
  onArchive: () => void,
  id: string;
  canExpand: boolean;
  isExpanded: boolean;
  docIcon?: string;
  isActive: boolean;
  level: number;
}

export const ListItem = ({ id, canExpand, onExpanded, onCreateChild, onArchive, isActive, isExpanded, docIcon, level = 0, label, onClick, icon: Icon }: ItemProps) => {
  const ChevronIcon = isExpanded ? ChevronDown : ChevronRight;
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);

  return (
    <>

      <div
        role="button"
        onClick={onClick}
        style={{ paddingLeft: level ? `${(level * 25) + 12}px` : "12px" }}
        className={cn(
          "flex group items-center gap-2 hover:bg-primary/5 cursor-pointer p-0.5 px-1.5 select-none font-medium text-muted-foreground group/item transition-all ease-in-out duration-300",
          isActive && "bg-primary/5 text-primary"
        )}
      >
        {(!!id && canExpand) && (
          <div
            role="button"
            onClick={(e) => {
              e.stopPropagation()
              onExpanded?.()
            }}
            className="h-full rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 hidden group-hover/item:block"
          >
            <ChevronIcon className="h-4 w-4 shrink-0 text-muted-foreground/50" />
          </div>
        )}
        <div className={canExpand ? "group-hover/item:hidden transition-all ease-in-out duration-300" : ""}>
          {docIcon ? (
            <div
              className="shrink-0 mr-2 text-[18px]"
            >
              {docIcon}
            </div>
          ) : (
            <Icon className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
        <span className="group-hover:truncate">
          {label}
        </span>
        <div
          className="ml-auto flex items-center gap-x-2"
        >
          <div
            role="button"
            onClick={(e) => {
              e.stopPropagation();
              onCreateChild();
            }}
            className="cursor-pointer opacity-0 group-hover:opacity-100 h-full ml-auto rounded hover:bg-neutral-300 dark:hover:bg-neutral-600"
          >
            <Plus className="h-4 w-4 text-muted-foreground" />
          </div>
          <div
            role="button"
            onClick={(e) => {
              e.stopPropagation();
              if (canExpand) {
                setIsArchiveDialogOpen(true)
              } else {
                onArchive()
              }
            }}
            className="cursor-pointer opacity-0 group-hover:opacity-100 h-full ml-auto rounded hover:bg-neutral-300 dark:hover:bg-neutral-600"
          >
            <Trash className="h-3.5 w-3.5 text-muted-foreground hover:text-red-600" />
          </div>
        </div>
        <Dialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
          <DialogTrigger className="hidden">
            Open
          </DialogTrigger>
          <DialogContent className="min-w-[250px] w-[400px]">
            <DialogHeader>
              <DialogTitle>Archiving Note</DialogTitle>
              <DialogDescription>
                This will archive all the children notes as well.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-start">
              <DialogClose asChild>
                <Button type="button" className="cursor-pointer" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button type="button" className="cursor-pointer" variant={"destructive"} onClick={onArchive}>
                  Confirm
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div >
    </>
  )
}

export const ListItemSkeleton = () => {
  return (
    <div
      style={{ paddingLeft: "12px" }}
      className="flex gap-2 py-1"
    >
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-4 w-[40%]" />
    </div>
  )
}
