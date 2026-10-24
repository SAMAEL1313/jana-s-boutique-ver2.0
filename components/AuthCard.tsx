import { useEffect, useState, type ComponentProps, type ReactNode } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import Wordmark from "@/components/Wordmark";

/** Full-screen backdrop + card shared by every sign-in / password page. */
export default function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFadeIn(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto bg-[url('/images/authbackground.jpg')] bg-cover bg-fixed bg-center p-4">
      <div className="absolute inset-0 bg-[#1a120c]/55 dark:bg-black/70" />
      <ThemeToggle className="absolute top-5 right-5 bg-surface/80" />

      <div
        className={`card relative w-full max-w-[420px] bg-surface/95 px-9 py-10 text-ink shadow-2xl backdrop-blur-sm transition-all duration-700 ease-out ${fadeIn ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
      >
        <Link href="/" className="mb-6 flex justify-center" aria-label="Back to the shop">
          <Wordmark size="sm" />
        </Link>
        <h2 className="text-center font-display text-3xl font-medium">{title}</h2>
        <div className="mx-auto mt-3 mb-7 h-px w-12 bg-gold" />
        {children}
      </div>
    </div>
  );
}

export function AuthInput(props: ComponentProps<"input">) {
  return <input {...props} className="input-field" />;
}

export function AuthButton({ children, ...props }: ComponentProps<"button">) {
  return (
    <button {...props} className="btn mt-1 w-full">
      {children}
    </button>
  );
}

export function AuthMessage({ children }: { children: ReactNode }) {
  return <p className="mt-4 text-center text-sm text-accent">{children}</p>;
}

export function AuthLink({ children, ...props }: ComponentProps<"button">) {
  return (
    <button type="button" {...props} className="cursor-pointer text-accent underline-offset-4 hover:underline">
      {children}
    </button>
  );
}
