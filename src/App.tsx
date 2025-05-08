import "./App.css";
import {
  RouterProvider,
} from "react-router";
import router from "./routers.tsx"
import { Theme, ThemeProvider } from "./components/theme-provider.tsx";
import { Toaster } from "@/components/ui/sonner";
import { getCurrentWindow } from '@tauri-apps/api/window';
import { useEffect } from "react";

function App() {
  useEffect(() => {
    let unlisten: () => void;

    const setupCloseHandler = async () => {
      const currentWindow = getCurrentWindow();

      unlisten = await currentWindow.onCloseRequested(async (event) => {
        // Prevent the window from closing immediately
        event.preventDefault();
        console.log('Performing cleanup before closing...');

        await currentWindow.destroy()
        // After cleanup, close the window
      });
    };

    setupCloseHandler();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, [])

  return (
    <ThemeProvider defaultTheme={Theme.LIGHT}>
      <div className="min-h-dvh max-w-dvw overflow-x-hidden">
        <RouterProvider router={router} />
      </div>
      <Toaster position="bottom-center" />
    </ThemeProvider>
  );
}

export default App;
