import { Outlet } from "react-router-dom";
import Header from "@/components/common/Header";
import Sidebar from "@/components/common/Sidebar";

export default function AppLayout() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
