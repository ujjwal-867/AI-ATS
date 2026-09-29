"use client";

import {
  GraduationCap,
  Briefcase,
  FolderGit2,
  Award,
} from "lucide-react";


export default function ProfileTimeline({ candidate }) {

  if (!candidate) return null;


  function parseData(data, fallback) {

    try {

      if (typeof data === "string") {
        return JSON.parse(data || fallback);
      }

      return data || JSON.parse(fallback);

    }
    catch {

      return JSON.parse(fallback);

    }

  }



  const education = parseData(
    candidate.education,
    "{}"
  );


  const experience = parseData(
    candidate.experience,
    "{}"
  );


  const projects = parseData(
    candidate.projects,
    "[]"
  );


  const certifications = parseData(
    candidate.certifications,
    "[]"
  );



  return (

    <div className="mt-4 space-y-4">


      {/* Education */}

      <section
        className="
        rounded-xl
        bg-slate-900
        p-4
        "
      >

        <div className="mb-3 flex items-center gap-2">

          <GraduationCap
            size={18}
            className="text-blue-400"
          />

          <h3 className="font-semibold text-white">
            Education
          </h3>

        </div>


        <p className="text-sm text-slate-300">
          {education.degree || "Not available"}
        </p>


        {
          education.institute && (

            <p className="text-xs text-slate-400">
              {education.institute}
            </p>

          )
        }


        {
          education.years && (

            <p className="text-xs text-slate-400">
              {
                Array.isArray(education.years)
                  ? education.years.join(" - ")
                  : education.years
              }
            </p>

          )
        }


      </section>




      {/* Experience */}

      <section
        className="
        rounded-xl
        bg-slate-900
        p-4
        "
      >

        <div className="mb-3 flex items-center gap-2">


          <Briefcase
            size={18}
            className="text-blue-400"
          />


          <h3 className="font-semibold text-white">
            Experience
          </h3>


        </div>



        <p className="text-sm text-slate-300">

          {
            experience.job_titles?.length
              ? experience.job_titles.join(", ")
              : "Fresher"
          }

        </p>



        <p className="text-xs text-slate-400">

          {experience.years || 0} years

        </p>


      </section>





      {/* Projects */}

      <section
        className="
        rounded-xl
        bg-slate-900
        p-4
        "
      >

        <div className="mb-3 flex items-center gap-2">


          <FolderGit2
            size={18}
            className="text-blue-400"
          />


          <h3 className="font-semibold text-white">
            Projects
          </h3>


        </div>




        {
          projects.length > 0 ?


          projects.map((project,index)=>(


            <div
              key={index}
              className="mb-4"
            >


              <h4 className="font-semibold text-white">
                {project.title || "Project"}
              </h4>



              <p className="mt-1 text-sm text-slate-300">

                {
                  project.description ||
                  "No description available"
                }

              </p>




              <div className="mt-2 flex flex-wrap gap-2">


                {
                  project.technologies?.map(
                    (tech,i)=>(

                      <span
                        key={i}
                        className="
                        rounded-full
                        bg-blue-500/20
                        px-3
                        py-1
                        text-xs
                        text-blue-300
                        "
                      >

                        {tech}

                      </span>

                    )
                  )
                }


              </div>


            </div>


          ))


          :

          <p className="text-sm text-slate-400">
            No projects available
          </p>


        }


      </section>





      {/* Certifications */}

      <section
        className="
        rounded-xl
        bg-slate-900
        p-4
        "
      >


        <div className="mb-3 flex items-center gap-2">


          <Award
            size={18}
            className="text-blue-400"
          />


          <h3 className="font-semibold text-white">
            Certifications
          </h3>


        </div>




        {

          certifications.length > 0 ?


          certifications.map((cert,index)=>(


            <p
              key={index}
              className="
              text-sm
              text-slate-300
              "
            >

              • {typeof cert === "string"
                  ? cert
                  : cert.name || "Certification"}

            </p>


          ))


          :

          <p className="text-sm text-slate-400">
            No certifications available
          </p>


        }


      </section>



    </div>

  );

}