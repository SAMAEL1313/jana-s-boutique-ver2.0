import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

/** Switches between light and dark mode and remembers the choice. */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [isDark, setIsDark] = useState<boolean | null>(null);

  // The real theme is only known in the browser (set by the script in _document).
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // storage unavailable — the toggle still works for this visit
    }
    setIsDark(next);
  };

  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-gold hover:text-gold ${className}`}
    >
      {isDark === null ? null : isDark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}
