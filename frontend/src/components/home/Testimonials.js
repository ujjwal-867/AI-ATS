"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Senior Recruiter",
    company: "Google",
    text: "AI ATS reduced our hiring time by 60%.",
  },
  {
    name: "Michael Chen",
    role: "HR Manager",
    company: "Amazon",
    text: "The ATS score engine helped us filter candidates faster.",
  },
  {
    name: "Emily Brown",
    role: "Talent Lead",
    company: "Microsoft",
    text: "An excellent AI-powered hiring platform.",
  },
];


export default function Testimonials() {

  return (

    <section className="bg-slate-950 px-8 py-24">

      <div className="mx-auto max-w-7xl">

        <h2 className="
          mb-16
          text-center
          text-5xl
          font-bold
          text-white
        ">
          Trusted by Recruiters
        </h2>


        <div className="
          grid
          gap-8
          md:grid-cols-3
        ">

          {testimonials.map((item, index) => (

            <motion.div

              key={item.name}

              initial={{
                opacity: 0,
                y: 30,
              }}

              whileInView={{
                opacity: 1,
                y: 0,
              }}

              transition={{
                delay: index * 0.15,
              }}

              whileHover={{
                y: -10,
              }}

              className="
                rounded-3xl
                border
                border-slate-800
                bg-white/5
                p-8
                backdrop-blur-xl
              "

            >

              <div className="
                mb-4
                text-xl
                text-yellow-400
              ">
                ★★★★★
              </div>


              <p className="
                mb-6
                text-slate-300
              ">
                &quot;{item.text}&quot;
              </p>


              <h3 className="
                font-bold
                text-white
              ">
                {item.name}
              </h3>


              <p className="
                text-sm
                text-slate-400
              ">
                {item.role} • {item.company}
              </p>


            </motion.div>

          ))}

        </div>

      </div>

    </section>

  );

}