import UploadZone from "@/components/upload/UploadZone";

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-10">
      <h1 className="mb-8 text-4xl font-bold text-white">
        Resume Upload 📄
      </h1>

      <UploadZone />
    </div>
  );
}