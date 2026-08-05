"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useDropzone } from "react-dropzone";

import {
  UploadCloud,
  FileText,
  Loader2,
  CheckCircle2,
  XCircle,
  Trash2,
  User,
  Mail,
  Phone,
  BadgeCheck,
  Briefcase,
  Target,
} from "lucide-react";


import request, {
  getJobs,
  matchCandidate,
} from "@/services/api";


export default function UploadZone() {


  const [file,setFile] = useState(null);

  const [jobs,setJobs] = useState([]);

  const [selectedJob,setSelectedJob] = useState("");

  const [candidate,setCandidate] = useState(null);

  const [matchResult,setMatchResult] = useState(null);


  const [uploading,setUploading] = useState(false);

  const [matching,setMatching] = useState(false);


  const [successMessage,setSuccessMessage] = useState("");

  const [errorMessage,setErrorMessage] = useState("");



  useEffect(()=>{

    async function loadJobs(){

      try{

        const data = await getJobs();

        setJobs(data);

      }catch(error){

        console.log(error);

      }

    }


    loadJobs();

  },[]);




  const onDrop = useCallback((files)=>{

    if(!files.length)
      return;


    setFile(files[0]);

    setCandidate(null);

    setMatchResult(null);

    setSuccessMessage("");

    setErrorMessage("");

  },[]);




  const handleUpload = async()=>{


    if(!file){

      setErrorMessage(
        "Please choose resume first"
      );

      return;

    }


    try{


      setUploading(true);

      setErrorMessage("");



      const formData = new FormData();

      formData.append(
        "file",
        file
      );



      const response =
        await request(
          "/api/upload/",
          {
            method:"POST",
            body:formData,
          }
        );



      setCandidate(
        response.candidate
      );


      setSuccessMessage(
        response.message
      );


      setFile(null);



    }catch(error){

      setErrorMessage(
        error.message
      );


    }finally{

      setUploading(false);

    }

  };




  const handleMatch = async()=>{


    if(!candidate?.id){

      setErrorMessage(
        "Upload resume first"
      );

      return;

    }


    if(!selectedJob){

      setErrorMessage(
        "Select job first"
      );

      return;

    }



    try{


      setMatching(true);


      const result =
        await matchCandidate(
          candidate.id,
          selectedJob
        );



      setMatchResult(
        result
      );



      setCandidate(prev=>({

        ...prev,

        ats_score:
          result.ats_score,

      }));



    }catch(error){

      setErrorMessage(
        error.message
      );


    }finally{

      setMatching(false);

    }


  };



  const removeFile=()=>{

    setFile(null);

    setCandidate(null);

    setMatchResult(null);

  };



  const {
    getRootProps,
    getInputProps,
    isDragActive,

  }=useDropzone({

    multiple:false,

    onDrop,

    accept:{

      "application/pdf":[
        ".pdf"
      ],

      "application/msword":[
        ".doc"
      ],

      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      [
        ".docx"
      ],

    },

  });
    return (

    <div className="space-y-8">


      {/* Upload Area */}

      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-3xl border-2 border-dashed p-16 text-center transition-all duration-300 ${
          isDragActive
            ? "border-green-500 bg-green-50"
            : "border-[#D4AF37] bg-[#FFFDF5] hover:bg-[#FFF8E1]"
        }`}
      >

        <input {...getInputProps()} />


        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#D4AF37]/10">

          <UploadCloud
            size={46}
            className="text-[#D4AF37]"
          />

        </div>


        <h2 className="mt-6 text-3xl font-bold text-[#111827]">

          Drag & Drop Resume

        </h2>


        <p className="mt-3 text-lg text-slate-500">

          Upload PDF, DOC or DOCX resumes

        </p>


        <button
          type="button"
          className="mt-8 rounded-2xl bg-[#D4AF37] px-8 py-4 font-semibold text-black hover:bg-[#E7C75F]"
        >

          Choose Resume

        </button>


      </div>




      {/* Selected Resume */}


      {file && (

        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">


          <div className="border-b px-8 py-6">

            <h3 className="text-xl font-bold">

              Selected Resume

            </h3>

          </div>



          <div className="flex items-center justify-between px-8 py-6">


            <div className="flex items-center gap-5">


              <div className="rounded-2xl bg-[#FFF8E1] p-4">

                <FileText
                  className="text-[#D4AF37]"
                  size={28}
                />

              </div>


              <div>

                <h4 className="font-semibold">

                  {file.name}

                </h4>


                <p className="text-sm text-slate-500">

                  {(file.size/1024/1024).toFixed(2)} MB

                </p>


              </div>


            </div>



            <button
              onClick={removeFile}
              className="text-red-500"
            >

              <Trash2/>

            </button>



          </div>


        </div>

      )}






      {/* Upload Button */}


      <button

        onClick={handleUpload}

        disabled={!file || uploading}

        className="w-full rounded-2xl bg-green-600 py-4 text-lg font-semibold text-white hover:bg-green-700 disabled:opacity-50"

      >

        {uploading ? (

          <span className="flex justify-center gap-3">

            <Loader2
              className="animate-spin"
            />

            Uploading & Analyzing...

          </span>

        ):(

          "Upload & Analyze Resume"

        )}


      </button>





      {/* Messages */}


      {successMessage && (

        <div className="rounded-3xl border border-green-200 bg-green-50 p-6 text-green-700">

          <CheckCircle2 className="inline mr-2"/>

          {successMessage}

        </div>

      )}



      {errorMessage && (

        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">

          <XCircle className="inline mr-2"/>

          {errorMessage}

        </div>

      )}
            {/* Candidate Profile */}

      {candidate && (

        <>

        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">


          <div className="border-b px-8 py-6">

            <h2 className="text-2xl font-bold text-[#111827]">

              Candidate Profile

            </h2>

          </div>



          <div className="grid gap-8 p-8 md:grid-cols-2">


            <div className="flex items-center gap-4">

              <div className="rounded-2xl bg-[#FFF8E1] p-4">

                <User
                  className="text-[#D4AF37]"
                  size={26}
                />

              </div>


              <div>

                <p className="text-sm text-slate-500">
                  Full Name
                </p>

                <p className="font-semibold">
                  {candidate.name}
                </p>

              </div>

            </div>




            <div className="flex items-center gap-4">

              <div className="rounded-2xl bg-[#FFF8E1] p-4">

                <Mail
                  className="text-[#D4AF37]"
                  size={26}
                />

              </div>


              <div>

                <p className="text-sm text-slate-500">
                  Email
                </p>

                <p className="font-semibold">
                  {candidate.email}
                </p>

              </div>

            </div>




            <div className="flex items-center gap-4">

              <div className="rounded-2xl bg-[#FFF8E1] p-4">

                <Phone
                  className="text-[#D4AF37]"
                  size={26}
                />

              </div>


              <div>

                <p className="text-sm text-slate-500">
                  Phone
                </p>

                <p className="font-semibold">
                  {candidate.phone || "-"}
                </p>

              </div>

            </div>




            <div className="flex items-center gap-4">

              <div className="rounded-2xl bg-green-100 p-4">

                <BadgeCheck
                  className="text-green-600"
                  size={26}
                />

              </div>


              <div>

                <p className="text-sm text-slate-500">
                  Status
                </p>

                <p className="font-semibold text-green-600">
                  Applied
                </p>

              </div>

            </div>



          </div>



          <div className="px-8 pb-8">

            <p className="text-sm text-slate-500">
              ATS Score
            </p>


            <p className="mt-2 text-5xl font-bold text-green-600">

              {candidate.ats_score || 0}%

            </p>


          </div>


        </div>





        {/* Job Matching */}


        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">


          <div className="flex items-center gap-3">


            <Briefcase
              className="text-[#D4AF37]"
            />


            <h2 className="text-2xl font-bold">

              Select Job For Matching

            </h2>


          </div>



          <select

            value={selectedJob}

            onChange={(e)=>
              setSelectedJob(
                e.target.value
              )
            }

            className="mt-6 w-full rounded-xl border p-4"

          >

            <option value="">

              Select Job

            </option>



            {jobs.map((job)=>(

              <option
                key={job.id}
                value={job.id}
              >

                {job.title} - {job.company}

              </option>

            ))}



          </select>




          <button

            onClick={handleMatch}

            disabled={matching}

            className="mt-6 w-full rounded-xl bg-indigo-600 py-4 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"

          >

            {matching
              ? "Analyzing..."
              : "Analyze ATS Match"
            }


          </button>



        </div>


        </>

      )}






      {/* ATS Result */}


      {matchResult && (


        <div className="rounded-3xl border border-green-200 bg-green-50 p-8">


          <div className="flex items-center gap-3">


            <Target
              className="text-green-600"
            />


            <h2 className="text-3xl font-bold text-green-700">

              ATS Match Result

            </h2>


          </div>




          <p className="mt-6 text-6xl font-bold text-green-600">

            {matchResult.ats_score}%

          </p>




          <div className="mt-8">


            <h3 className="font-bold text-green-700">

              Matched Skills

            </h3>


            <p className="mt-2">

              {matchResult.matched_skills.join(", ")}

            </p>


          </div>




          <div className="mt-6">


            <h3 className="font-bold text-red-700">

              Missing Skills

            </h3>


            <p className="mt-2 text-red-600">

              {matchResult.missing_skills.join(", ")}

            </p>


          </div>


        </div>


      )}



    </div>

  );

}