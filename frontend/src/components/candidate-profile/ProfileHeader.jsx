"use client";

import {
  Mail,
  Phone,
  Star,
} from "lucide-react";


export default function ProfileHeader({
  candidate
}){

  if(!candidate) return null;


  return (

    <div className="
    rounded-xl
    border
    border-slate-800
    bg-slate-900
    p-3
    ">


      <div className="
      flex
      justify-between
      ">


        <div>

          <h2 className="
          text-xl
          font-bold
          text-white
          ">
            {candidate.name}
          </h2>


          <p className="
          text-sm
          text-slate-400
          ">
            {candidate.status}
          </p>


          <div className="
          mt-2
          space-y-1
          text-xs
          text-slate-400
          ">

            <p>
              <Mail
                size={13}
                className="mr-1 inline"
              />
              {candidate.email}
            </p>


            <p>
              <Phone
                size={13}
                className="mr-1 inline"
              />
              {candidate.phone}
            </p>


          </div>


        </div>


        <div className="
        rounded-xl
        bg-yellow-100
        p-2
        text-center
        ">

          <Star
            size={16}
            className="mx-auto text-yellow-600"
          />

          <p className="
          font-bold
          text-black
          ">
            {candidate.ats_score}%
          </p>

        </div>


      </div>


    </div>

  );

}