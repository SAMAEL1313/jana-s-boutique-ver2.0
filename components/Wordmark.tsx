/** Typographic logo — works on both light and dark backgrounds. */
export default function Wordmark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const name = { sm: "text-2xl", md: "text-4xl", lg: "text-6xl md:text-7xl" }[size];
  const sub = { sm: "text-[0.55rem]", md: "text-[0.65rem]", lg: "text-sm" }[size];

  return (
    <span className="inline-flex flex-col items-center leading-none">
      <span className={`font-display font-medium tracking-[0.12em] ${name}`}>JANA&rsquo;S</span>
      <span className={`mt-1 font-display tracking-[0.6em] text-gold uppercase ${sub}`}>boutique</span>
    </span>
  );
}
