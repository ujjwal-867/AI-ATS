import AppLayout from "@/components/layout/AppLayout";
import DashboardHeader from "@/components/dashboard/header/DashboardHeader";
import UploadZone from "@/components/upload/UploadZone";

export const metadata = {
  title: "Resume Upload | AI ATS",
};

export default function UploadPage() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-[1700px] space-y-8">

        <DashboardHeader />

        <section className="overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white shadow-sm">

          <div className="border-b border-[#F1F5F9] px-10 py-8">

            <span className="text-sm font-semibold uppercase tracking-wider text-[#D4AF37]">
              Resume Management
            </span>

            <h1 className="mt-2 text-4xl font-bold text-[#111827]">
              Resume Upload
            </h1>

            <p className="mt-3 max-w-3xl text-lg text-slate-600">
              Upload resumes in PDF or DOCX format. Our AI automatically
              extracts candidate information, analyzes skills, generates
              ATS scores, and adds candidates to your recruitment
              pipeline.
            </p>

          </div>

          <div className="p-10">

            <UploadZone />

          </div>

        </section>

      </div>
    </AppLayout>
  );
}