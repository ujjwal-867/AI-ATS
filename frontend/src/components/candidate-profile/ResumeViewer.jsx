"use client";

import {
  Download,
  ExternalLink,
  FileText,
} from "lucide-react";


const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";


export default function ResumeViewer({
  resumeUrl
}){

  if(!resumeUrl){
    return null;
  }


  const url = `${API_URL}/${resumeUrl}`;


  return (

    <section className="
    rounded-2xl
    border
    border-slate-200
    bg-white
    p-4
    shadow-sm
    ">

      <div className="
      mb-3
      flex
      items-center
      gap-2
      ">

        <FileText
          size={20}
          className="text-[#D4AF37]"
        />

        <h2 className="
        font-bold
        text-[#111827]
        ">
          Resume
        </h2>

      </div>


      <div className="
      flex
      gap-3
      ">

        <a
          href={url}
          target="_blank"
          className="
          flex
          items-center
          gap-2
          rounded-xl
          bg-[#D4AF37]
          px-4
          py-2
          text-sm
          font-semibold
          text-black
          "
        >

          <ExternalLink size={16}/>

          View

        </a>


        <a
          href={url}
          download
          className="
          flex
          items-center
          gap-2
          rounded-xl
          border
          border-slate-200
          px-4
          py-2
          text-sm
          font-semibold
          "
        >

          <Download size={16}/>

          Download

        </a>


      </div>

    </section>

  );

}