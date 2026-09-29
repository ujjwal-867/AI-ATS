"use client";

import {
  Bell,
  Search,
  Sun,
  Moon,
  UserCircle2,
} from "lucide-react";

import { useTheme } from "next-themes";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


export default function Navbar() {

  const {
    theme,
    setTheme,
  } = useTheme();


  return (

    <header className="
      sticky
      top-0
      z-50
      flex
      h-20
      items-center
      justify-between
      border-b
      border-[#ECECEC]
      bg-white/90
      px-8
      backdrop-blur-xl
    ">

      {/* Left */}

      <div>

        <h1 className="
          text-2xl
          font-bold
          text-[#111827]
        ">
          Dashboard
        </h1>


        <p className="
          text-sm
          text-slate-500
        ">
          Welcome back. Here&apos;s what&apos;s happening today.
        </p>

      </div>



      {/* Right */}

      <div className="
        flex
        items-center
        gap-4
      ">


        <div className="
          relative
          w-80
        ">

          <Search
            size={18}
            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-slate-400
            "
          />


          <Input
            placeholder="Search candidates..."
            className="pl-11"
          />

        </div>




        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setTheme(
              theme === "dark"
                ? "light"
                : "dark"
            )
          }
        >

          {
            theme === "dark"
              ?
              <Sun size={18} />
              :
              <Moon size={18} />
          }

        </Button>




        <Button
          variant="outline"
          size="icon"
          className="relative"
        >

          <Bell size={18} />

          <span className="
            absolute
            right-2
            top-2
            h-2
            w-2
            rounded-full
            bg-[#D4AF37]
          "/>

        </Button>




        <div className="
          flex
          items-center
          gap-3
          rounded-2xl
          border
          border-[#ECECEC]
          bg-white
          px-4
          py-2
          shadow-sm
        ">


          <div className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-full
            bg-[#D4AF37]
            text-white
          ">

            <UserCircle2 size={28}/>

          </div>



          <div>

            <h3 className="
              text-sm
              font-semibold
              text-[#111827]
            ">
              Admin
            </h3>


            <p className="
              text-xs
              text-slate-500
            ">
              HR Manager
            </p>


          </div>


        </div>


      </div>


    </header>

  );

}