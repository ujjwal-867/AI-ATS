"use client";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">

      <Sidebar />

      <div className="flex flex-1 flex-col">

        <Topbar />

        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] p-8">
          {children}
        </main>

      </div>

    </div>
  );
}