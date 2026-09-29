"use client";

import { X, Download, CalendarPlus } from "lucide-react";

import ProfileHeader from "./ProfileHeader";
import ProfileSkills from "./ProfileSkills";
import ProfileTimeline from "./ProfileTimeline";


export default function CandidateProfileDrawer({
  open,
  candidate,
  onClose,
}) {

  if (!candidate) return null;


  return (
    <>

      <div
        onClick={onClose}
        className={`
          fixed inset-0 z-40
          bg-black/50
          transition
          ${
            open
            ? "visible opacity-100"
            : "invisible opacity-0"
          }
        `}
      />


      <aside
        className={`
          fixed
          right-0
          top-0
          z-50
          h-screen
          w-full
          max-w-lg
          overflow-y-auto
          bg-slate-950
          p-4
          transition-transform
          duration-300
          ${
            open
            ? "translate-x-0"
            : "translate-x-full"
          }
        `}
      >


        <div
          className="
          mb-3
          flex
          items-center
          justify-between
          border-b
          border-slate-800
          pb-2
          "
        >

          <h2 className="
          text-lg
          font-bold
          text-white
          ">
            Candidate Profile
          </h2>


          <button
            onClick={onClose}
            className="
            rounded-lg
            p-1
            text-slate-400
            hover:bg-slate-800
            "
          >
            <X size={20}/>
          </button>

        </div>



        <ProfileHeader candidate={candidate}/>


        <ProfileSkills candidate={candidate}/>


        <ProfileTimeline candidate={candidate}/>



        <div
          className="
          sticky
          bottom-0
          mt-4
          flex
          gap-2
          bg-slate-950
          py-2
          "
        >

          <a
            href={
              candidate.resume_url
              ? `http://127.0.0.1:8000/${candidate.resume_url}`
              : "#"
            }
            target="_blank"
            rel="noopener noreferrer"
            className="
            flex
            flex-1
            items-center
            justify-center
            gap-2
            rounded-lg
            bg-indigo-600
            py-2
            text-sm
            font-medium
            text-white
            hover:bg-indigo-700
            "
          >

            <Download size={15}/>
            Resume

          </a>



          <button
            className="
            flex
            flex-1
            items-center
            justify-center
            gap-2
            rounded-lg
            border
            border-slate-700
            py-2
            text-sm
            font-medium
            text-white
            hover:border-indigo-500
            "
          >

            <CalendarPlus size={15}/>
            Interview

          </button>


        </div>


      </aside>

    </>
  );
}