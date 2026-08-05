export default function StatusBadge({
  status,
}) {
  const styles = {
    HIGH: "bg-green-600",
    MEDIUM: "bg-yellow-500",
    LOW: "bg-red-600",

    Active: "bg-green-600",
    Pending: "bg-yellow-500",
    Rejected: "bg-red-600",

    Hired: "bg-blue-600",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${
        styles[status] || "bg-slate-600"
      }`}
    >
      {status}
    </span>
  );
}