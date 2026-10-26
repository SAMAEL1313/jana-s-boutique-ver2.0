import { useEffect, useState } from "react";
import Wordmark from "@/components/Wordmark";

const SEEN_KEY = "splashSeen";
const SHOW_MS = 1800;
const FADE_MS = 600;

/** Branded intro shown over the site on the first page load of a browser session. */
export default function SplashScreen() {
  // Rendered on the server too, so the page never flashes before the splash.
  const [phase, setPhase] = useState<"show" | "fade" | "gone">("show");

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      // Storage unavailable: show the splash every load.
    }
    if (seen) {
      setPhase("gone");
      return;
    }

    const fade = setTimeout(() => setPhase("fade"), SHOW_MS);
    const gone = setTimeout(() => setPhase("gone"), SHOW_MS + FADE_MS);
    return () => {
      clearTimeout(fade);
      clearTimeout(gone);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      aria-hidden
      onClick={() => setPhase("fade")}
      onTransitionEnd={() => phase === "fade" && setPhase("gone")}
      className={`fixed inset-0 z-[2000] flex flex-col items-center justify-center bg-paper text-ink transition-opacity duration-[600ms] ${phase === "fade" ? "pointer-events-none opacity-0" : "opacity-100"}`}
    >
      <div className="animate-splashRise">
        <Wordmark size="lg" />
      </div>
      <div className="animate-splashRule mt-6 h-px w-40 origin-center bg-gold" />
      <p className="animate-splashRise mt-5 font-display text-sm tracking-[0.3em] text-muted uppercase italic [animation-delay:0.4s]">
        Curated with care
      </p>
    </div>
  );
}
