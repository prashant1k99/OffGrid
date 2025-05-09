import {
  createBrowserRouter,
  Link,
} from "react-router";
import MainLayout from "./layout/main";
import Dashboard from "./pages/Dashboard";
import Document from "./pages/Document";
import ArchivedDocument from "./pages/ArchivedDocument";

const router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      {
        index: true,
        Component: Dashboard
      },
      {
        path: "/documents/:docId",
        Component: Document
      },
      {
        path: "/archived/:docId",
        Component: ArchivedDocument
      },
      {
        path: "/data",
        Component: () => (
          <div className="p-4">
            <div>Data Page </div>
            < Link to={"/"} > Go to Home </Link>
          </div>
        )
      }
    ]
  },
]);

export default router
