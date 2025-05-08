import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, LucideIcon } from "lucide-react";
import { platform } from '@tauri-apps/plugin-os';
import { Skeleton } from "./ui/skeleton";

interface ItemProps {
  label: String;
  icon: LucideIcon;
  onClick: (id?: String) => void;
  onExpanded?: () => void,
  id?: String;
  canExpand?: boolean;
  isExpanded?: boolean;
  docIcon?: String;
  isActive?: boolean;
  level?: number;
  isSearch?: boolean;
}

export const Item = ({ id, canExpand, onExpanded, isActive, isExpanded, docIcon, level = 0, label, onClick, icon: Icon, isSearch }: ItemProps) => {
  const ChevronIcon = isExpanded ? ChevronDown : ChevronRight;

  const getSearchText = platform() == "macos" ? "⌘" : "CTRL"

  return (
    <div
      role="button"
      onClick={() => onClick(id)}
      style={{ paddingLeft: level ? `${(level * 25) + 12}px` : "12px" }}
      className={cn(
        "flex items-center gap-2 hover:bg-primary/5 cursor-pointer p-0.5 select-none font-medium text-muted-foreground group/item transition-all duration-300",
        isActive && "bg-primary/5 text-primary"
      )}
    >
      {(!!id && canExpand) && (
        <div
          role="button"
          onClick={onExpanded}
          className={cn(
            "h-full rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 hidden group-hover/item:block",
            !isExpanded && "hidden group-hover/item:block"
          )}
        >
          <ChevronIcon className="h-4 w-4 shrink-0 text-muted-foreground/50" />
        </div>
      )}
      {docIcon ? (
        <div className="shrink-0 mr-2 text-[18px]">
          {docIcon}
        </div>
      ) : (
        <Icon className="w-4 h-4 text-muted-foreground" />
      )}
      <span className="truncate">
        {label}
      </span>
      {isSearch && (
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted p-1.5 font-mono text-[12px] font-medium text-muted-foreground mr-2">
          <span className="text-sm">{getSearchText}</span>K
        </kbd>
      )}
    </div>
  )
}

export const ItemSkeleton = () => {
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
