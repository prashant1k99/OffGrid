import {
  createBrowserRouter,
  Link,
} from "react-router";
import MainLayout from "./layout/main";

const router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      {
        index: true,
        Component: () => (
          <div className="p-4">
            <div>Hello World</ div >
            <Link to={"/data"} >
              Go to Data
            </Link>
          </div>
        )
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
