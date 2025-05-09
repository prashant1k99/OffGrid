import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { platform } from '@tauri-apps/plugin-os';

interface ItemProps {
  label: String;
  icon: LucideIcon;
  onClick: () => void;
  shortcutKey?: string;
  className?: string;
}

const ItemOption = ({ label, onClick, icon: Icon, shortcutKey, className }: ItemProps) => {
  const getSearchText = platform() == "macos" ? "⌘" : "CTRL"

  return (
    <div
      role="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 hover:bg-primary/5 cursor-pointer p-0.5 px-2.5 select-none font-medium text-muted-foreground group/item transition-all ease-in-out duration-300",
        className && className
      )}
    >
      <Icon className="w-4 h-4 text-muted-foreground" />
      <span className="truncate">
        {label}
      </span>
      {
        shortcutKey && (
          <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted p-1.5 font-mono text-[12px] font-medium text-muted-foreground">
            <span className="text-sm">{getSearchText}</span>{shortcutKey}
          </kbd>
        )
      }
    </div >
  )
}

export default ItemOption
