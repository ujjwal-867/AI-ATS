export default function SectionCard({
  title,
  subtitle,
  children,
  className = "",
}) {
  return (
    <section
      className={`rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl ${className}`}
    >
      {(title || subtitle) && (
        <div className="mb-8">
          {title && (
            <h2 className="text-2xl font-bold text-white">
              {title}
            </h2>
          )}

          {subtitle && (
            <p className="mt-2 text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {children}
    </section>
  );
}