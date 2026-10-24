import Link from "next/link";

export default function Breadcrumb({ paths }: { paths: string[] }) {
  if (paths.length === 0) return null;

  return (
    <nav className="my-4" aria-label="Breadcrumb">
      <ol className="flex items-center font-display text-sm font-semibold tracking-[0.2em] text-muted uppercase">
        {paths.map((path, index) => (
          <li key={index} className="flex items-center">
            {index !== 0 && <span className="mx-3 text-gold select-none">/</span>}
            {index === 0 ? (
              <Link href="/" className="transition-colors hover:text-gold">
                {path}
              </Link>
            ) : (
              <span className={index === paths.length - 1 ? "text-ink" : ""}>{path}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
