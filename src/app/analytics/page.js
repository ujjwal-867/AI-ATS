import Analytics from "@/components/dashboard/Analytics";

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <h1 className="mb-8 text-4xl font-bold text-white">
        Analytics Dashboard 📊
      </h1>

      <Analytics />
    </div>
  );
}