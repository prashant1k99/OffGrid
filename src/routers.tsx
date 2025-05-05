import {
  createBrowserRouter,
  Link,
} from "react-router";
import MainLayout from "./layout/main";
import Dashboard from "./pages/Dashboard";

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
