import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div className="min-h-screen bg-[var(--color-surface-0)] text-[var(--color-text-primary)]">
      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <Sidebar />

        {/* MAIN CONTENT */}
        <main className="min-w-0 flex-1 lg:ml-64">
          <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}