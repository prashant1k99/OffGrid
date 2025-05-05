import Navigation from "@/components/Navigation";
import { Outlet } from "react-router";


const MainLayout = () => {
  return (
    <div className="min-h-dvh flex dark:bg-[#1F1F1F]">
      <Navigation />
      <main className="p-2">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout;
