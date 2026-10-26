/** Typographic logo — works on both light and dark backgrounds. Pass `onGrove` on forest-green bands. */
export default function Wordmark({ size = "md", onGrove = false }: { size?: "sm" | "md" | "lg"; onGrove?: boolean }) {
  const name = { sm: "text-2xl", md: "text-4xl", lg: "text-6xl md:text-7xl" }[size];
  const sub = { sm: "text-[0.55rem]", md: "text-[0.65rem]", lg: "text-sm" }[size];

  return (
    <span className="inline-flex flex-col items-center leading-none">
      <span className={`font-display font-medium tracking-[0.12em] ${name}`}>JANA&apos;S</span>
      <span className={`mt-1 font-display tracking-[0.6em] uppercase ${onGrove ? "text-grove-gold" : "text-gold"} ${sub}`}>
        boutique
      </span>
    </span>
  );
}
