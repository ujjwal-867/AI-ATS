"use client";


export default function ProfileSkills({
  candidate
}){

  if(!candidate) return null;


  const skills =
    Array.isArray(candidate.skills)
    ? candidate.skills
    : JSON.parse(candidate.skills || "[]");


  return (

    <section className="
    mt-3
    rounded-xl
    border
    border-slate-800
    bg-slate-900
    p-3
    ">


      <h3 className="
      mb-2
      font-semibold
      text-white
      ">
        Skills
      </h3>


      <div className="
      flex
      flex-wrap
      gap-2
      ">


        {
          skills.map(skill=>(

            <span
              key={skill}
              className="
              rounded-full
              bg-indigo-500/10
              px-3
              py-1
              text-xs
              text-indigo-300
              "
            >
              {skill}
            </span>

          ))
        }


      </div>


    </section>

  );

}