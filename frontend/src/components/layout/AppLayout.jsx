"use client";

import { motion } from "framer-motion";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-white">
      <Sidebar />

      <motion.div
        layout
        className="
          flex
          min-w-0
          flex-1
          flex-col
          bg-white
        "
      >
        <Topbar />

        <main
          className="
            min-w-0
            flex-1
            bg-white
            px-5
            py-6
            md:px-8
            md:py-8
            xl:px-10
          "
        >
          {children}
        </main>
      </motion.div>
    </div>
  );
}