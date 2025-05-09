import { cn } from "@/lib/utils";
import { ChevronsLeft, LifeBuoy, MenuIcon, PlusCircle, Settings } from "lucide-react"
import { ElementRef, MouseEvent as ReactMouseEvent, useEffect, useRef, useState } from "react"
import { useLocation } from "react-router";
import { useMediaQuery } from "usehooks-ts"
import { ModeToggle } from "./theme-toggle";
import Lists from "./Lists";
import { createDocument } from "@/utils/createDocument";
import { Separator } from "./ui/separator";
import ItemOption from "./ItemOptions";
import TrashPopup from "./Trash";
import { ScrollArea } from "./ui/scroll-area";
import GlobalSearch from "./GlobalSearch";

const Navigation = () => {
  const location = useLocation();
  const pathname = location.pathname;

  const isTablet = useMediaQuery("(max-width: 768px)");

  const isResizingRef = useRef(false);
  const sidebarRef = useRef<ElementRef<"aside">>(null);
  const navbarRef = useRef<ElementRef<"div">>(null);

  const [isResetting, setIsResetting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(isTablet);

  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (isTablet) {
      collapse();
    }
  }, [pathname, isTablet]);

  useEffect(() => {
    if (isTablet) {
      collapse();
    } else {
      resetWidth();
    }
  }, [isTablet]);

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizingRef.current) return;

    let newWidth = e.clientX;

    if (newWidth < 240) newWidth = 240;
    if (newWidth > 480) newWidth = 480;

    if (sidebarRef.current && navbarRef.current) {
      sidebarRef.current.style.width = `${newWidth}px`;
      navbarRef.current.style.setProperty("left", `${newWidth}px`);
      navbarRef.current.style.setProperty("width", `calc(100% - ${newWidth}px)`);
    }
  };
  const handleMouseUp = () => {
    isResizingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleMouseDown = (e: ReactMouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();

    isResizingRef.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }

  const resetWidth = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(false);
      setIsResetting(true);

      let newWidth = isTablet ? "100%" : "240px";

      sidebarRef.current.style.width = newWidth;
      navbarRef.current.style.setProperty("left", newWidth);
      navbarRef.current.style.setProperty("width", `calc(100% - ${newWidth})`);

      // For animation duration to finish
      setTimeout(() => setIsResetting(false), 300);
    }
  }

  const collapse = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(true);
      setIsResetting(true);

      let newWidth = "0";

      sidebarRef.current.style.width = newWidth;
      navbarRef.current.style.setProperty("left", newWidth);
      navbarRef.current.style.setProperty("width", "100%");

      // For animation duration to finish
      setTimeout(() => setIsResetting(false), 300);
    }
  }

  return (
    <>
      <aside
        ref={sidebarRef}
        className={cn(
          "group/sidebar bg-primary-foreground overflow-y-auto relative flex w-60 flex-col z-[99999]",
          isResetting && "transition-all ease-in-out duration-300",
          isTablet && "w-0"
        )}
      >
        <div
          role="button"
          onClick={collapse}
          className={cn(
            "h-6 w-6 text-muted-foreground rounded-sm hover:bg-neutral-300 hover:dark:bg-gray-600 absolute top-4 right-2 opacity-0 group-hover/sidebar:opacity-100 transition",
            isTablet && "opacity-100"
          )}
        >
          <ChevronsLeft className="h-6 w-6" />
        </div>
        <div className="flex p-2 w-full group-hover/sidebar:w-[calc(100%-2rem)] transition-all ease-in-out duration-300">
          <ModeToggle />
        </div>
        <div className="p-2">
          <GlobalSearch open={searchOpen} onOpenChange={(val) => setSearchOpen(val)} />

          {/* CMD+N handled in GlobalSearch */}
          <ItemOption onClick={() => {
            createDocument({})
          }} label="New Page" icon={PlusCircle} shortcutKey="N" />

          <ItemOption onClick={() => {
            console.log("Show settings")
          }} label="Settings" icon={Settings} />
        </div>
        <Separator />
        <ScrollArea type="auto" className="flex-grow max-h-[83%] overflow-x-hidden overflow-y-auto p-2">
          <Lists />
        </ScrollArea>
        <Separator />
        <div className="p-2">
          <TrashPopup />
          <ItemOption label="Support" icon={LifeBuoy} onClick={() => console.log("Support")} />
        </div>
        <div
          onMouseDown={handleMouseDown}
          onClick={resetWidth}
          className="opacity-0 group-hover/sidebar:opacity-100 transition cursor-ew-resize absolute h-full w-0.5 bg-primary/10 right-0 top-0"
        />
      </aside>
      <div
        ref={navbarRef}
        className={cn(
          "absolute top-0 z-[99999] left-60 w-[calc(100%-240px)]",
          isResetting && "transition-all ease-in-out duration-300",
          isTablet && "left-0 w-full"
        )}
      >
        <nav className="bg-transparent px-3 py-2 w-full">
          {isCollapsed && <MenuIcon role="button" onClick={resetWidth} className="h-5 w-5 text-muted-foreground " />}
        </nav>
      </div>
    </>
  )
}

export default Navigation
