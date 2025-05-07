import "./App.css";
import {
  RouterProvider,
} from "react-router";
import router from "./routers.tsx"
import { Theme, ThemeProvider } from "./components/theme-provider.tsx";
import { Toaster } from "@/components/ui/sonner"

function App() {
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
