"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  User,
  Video,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import { scheduleInterview } from "@/services/api";


export default function InterviewScheduler({
  candidateId,
}) {

  const [interviewDate,setInterviewDate] =
    useState("");

  const [interviewer,setInterviewer] =
    useState("");

  const [meetingLink,setMeetingLink] =
    useState("");

  const [loading,setLoading] =
    useState(false);

  const [message,setMessage] =
    useState("");



  async function handleSchedule(){
    if(
      !interviewDate ||
      !interviewer
    ){
      setMessage(
        "Please enter interview date and interviewer"
      );
    return;
  }

  try{

      setLoading(true);

      const response =
        await scheduleInterview(
          candidateId,
          {
            interview_date:
              interviewDate,

            interviewer,

            meeting_link:
              meetingLink,
          }
        );


      setMessage(
        response.message
      );


    }catch(error){

      setMessage(
        error.message
      );


    }finally{

      setLoading(false);

    }

  }



  return (

    <motion.div

      initial={{
        opacity:0,
        y:30,
      }}

      animate={{
        opacity:1,
        y:0,
      }}

      className="
      mx-auto
      max-w-xl
      rounded-3xl
      border
      border-slate-200
      bg-white
      p-8
      shadow-lg
      "

    >


      <div className="mb-8">

        <h2 className="
        text-3xl
        font-bold
        text-[#111827]
        ">
          Schedule Interview
        </h2>


        <p className="
        mt-2
        text-slate-500
        ">
          Arrange candidate interview and meeting details.
        </p>

      </div>



      <div className="space-y-5">


        <div>

          <label className="
          mb-2
          flex
          items-center
          gap-2
          font-semibold
          text-slate-700
          ">

            <CalendarDays
              size={18}
              className="text-[#D4AF37]"
            />

            Interview Date

          </label>


          <input

            type="datetime-local"

            value={interviewDate}

            onChange={(e)=>
              setInterviewDate(
                e.target.value
              )
            }

            className="
            w-full
            rounded-2xl
            border
            p-4
            outline-none
            focus:border-[#D4AF37]
            "

          />

        </div>




        <div>

          <label className="
          mb-2
          flex
          items-center
          gap-2
          font-semibold
          text-slate-700
          ">

            <User
              size={18}
              className="text-[#D4AF37]"
            />

            Interviewer

          </label>


          <input

            type="text"

            placeholder="Enter interviewer name"

            value={interviewer}

            onChange={(e)=>
              setInterviewer(
                e.target.value
              )
            }

            className="
            w-full
            rounded-2xl
            border
            p-4
            outline-none
            focus:border-[#D4AF37]
            "

          />


        </div>




        <div>

          <label className="
          mb-2
          flex
          items-center
          gap-2
          font-semibold
          text-slate-700
          ">

            <Video
              size={18}
              className="text-[#D4AF37]"
            />

            Meeting Link

          </label>


          <input

            type="text"

            placeholder="Google Meet / Zoom link"

            value={meetingLink}

            onChange={(e)=>
              setMeetingLink(
                e.target.value
              )
            }

            className="
            w-full
            rounded-2xl
            border
            p-4
            outline-none
            focus:border-[#D4AF37]
            "

          />


        </div>




        <button

          onClick={handleSchedule}

          disabled={loading}

          className="
          flex
          w-full
          items-center
          justify-center
          gap-3
          rounded-2xl
          bg-[#D4AF37]
          py-4
          font-bold
          text-black
          transition
          hover:bg-[#E7C75F]
          disabled:opacity-50
          "

        >

          {
            loading ?

            <>
            <Loader2
              className="animate-spin"
            />
            Scheduling...
            </>

            :

            <>
            <CalendarDays size={20}/>
            Schedule Interview
            </>
          }


        </button>




        {
          message &&

          <motion.div

            initial={{
              opacity:0,
              scale:.9,
            }}

            animate={{
              opacity:1,
              scale:1,
            }}

            className="
            flex
            items-center
            gap-3
            rounded-2xl
            bg-green-50
            p-4
            text-green-700
            "

          >

            <CheckCircle2/>

            {message}

          </motion.div>

        }


      </div>


    </motion.div>

  );

}