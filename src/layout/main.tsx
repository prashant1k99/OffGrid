import Navigation from "@/components/Navigation";
import { Outlet } from "react-router";


const MainLayout = () => {
  return (
    <div className="min-h-dvh max-h-dvh min-w-dvw max-w-dvw flex">
      <Navigation />
      <main className="p-2 w-full">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout;
