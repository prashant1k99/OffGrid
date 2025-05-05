import "./App.css";
import { ThemeProvider } from "./components/theme-provider";
import {
  RouterProvider,
} from "react-router";
import router from "./routers.tsx"

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <div className="min-h-dvh max-w-dvw overflow-x-hidden">
        <RouterProvider router={router} />
      </div>
    </ThemeProvider>
  );
}

export default App;
