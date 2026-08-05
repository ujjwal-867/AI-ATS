export default function PageHeader({
  title,
  description,
  children,
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-4xl font-bold text-white">
          {title}
        </h1>

        {description && (
          <p className="mt-2 text-slate-400">
            {description}
          </p>
        )}
      </div>

      {children && <div>{children}</div>}
    </div>
  );
}