import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/outline";
import Navbar from "@/components/Navbar";
import Wordmark from "@/components/Wordmark";

const featuredImages = [
  { src: "topsfeatured.jpg", category: "Tops", href: "/tops" },
  { src: "bottomsfeatured.jpg", category: "Bottoms", href: "/bottoms" },
  { src: "dressesfeatured.jpg", category: "Dresses", href: "/dresses" },
  { src: "perfumefeatured.jpg", category: "Perfumes", href: "/perfumes" },
  { src: "shoesfeatured.jpg", category: "Shoes", href: "/shoes/heels" },
  { src: "accessoriesfeatured.jpg", category: "Accessories", href: "/accessories/handbags" },
];

function Ornament() {
  return (
    <div className="flex items-center justify-center gap-4 text-gold" aria-hidden>
      <span className="h-px w-16 bg-gold/60" />
      <span className="font-display text-xl">❦</span>
      <span className="h-px w-16 bg-gold/60" />
    </div>
  );
}

export default function Home() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const left = direction === "left" ? el.scrollLeft - el.clientWidth : el.scrollLeft + el.clientWidth;
    el.scrollTo({ left, behavior: "smooth" });
  };

  const scrollToFeatured = () => document.getElementById("featured")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="bg-paper text-ink">
      <Navbar />

      {/* Hero */}
      <section className="relative h-screen w-full overflow-hidden">
        <Image
          src="/images/homepage.jpg"
          alt="Inside Jana's Boutique"
          fill
          className="object-cover object-center sepia-[0.25]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#140e09]/70 via-[#140e09]/45 to-[#140e09]/80" />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 pt-32 text-center text-[#f3ecdf]">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="font-display text-sm font-semibold tracking-[0.4em] text-[#c9a467] uppercase"
          >
            Curated Collections
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1 }}
            className="mt-5 font-display text-6xl font-medium italic md:text-8xl"
          >
            Timeless Elegance
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.3 }}
            className="mt-6 max-w-xl text-lg text-[#e6dccb]/90 md:text-xl"
          >
            Discover pieces that define your unique style.
          </motion.p>
          <motion.button
            onClick={scrollToFeatured}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5 }}
            className="mt-10 cursor-pointer rounded-sm border border-[#c9a467] px-10 py-3 font-display text-sm font-semibold tracking-[0.25em] text-[#f3ecdf] uppercase transition-colors hover:bg-[#c9a467] hover:text-[#140e09]"
          >
            Shop Now
          </motion.button>
        </div>
      </section>

      {/* Our story */}
      <section className="bg-surface px-6 py-28 text-center md:px-16">
        <p className="eyebrow">Our Story</p>
        <h2 className="mt-4 font-display text-4xl font-medium md:text-5xl">A wardrobe with a narrative</h2>
        <div className="my-8">
          <Ornament />
        </div>
        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted md:text-xl">
          Born from a passion for elegance and authenticity, our boutique brings you curated fashion pieces that embody
          grace, quality, and timeless charm. Every collection tells a story — yours.
        </p>
      </section>

      {/* Featured collection */}
      <section id="featured" className="relative bg-paper px-6 py-24 md:px-12">
        <div className="mb-12 text-center">
          <p className="eyebrow">The Collection</p>
          <h2 className="mt-4 font-display text-4xl font-medium md:text-5xl">Featured Collection</h2>
        </div>

        <button
          onClick={() => scroll("left")}
          className="absolute top-[60%] left-3 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-line bg-surface text-ink shadow transition-colors hover:border-gold hover:text-gold"
          aria-label="Scroll left"
        >
          &#8592;
        </button>
        <button
          onClick={() => scroll("right")}
          className="absolute top-[60%] right-3 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-line bg-surface text-ink shadow transition-colors hover:border-gold hover:text-gold"
          aria-label="Scroll right"
        >
          &#8594;
        </button>

        <div
          ref={scrollRef}
          className="flex gap-8 overflow-x-auto scroll-smooth px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {featuredImages.map((item) => (
            <Link
              key={item.src}
              href={item.href}
              className="group card relative min-w-[300px] overflow-hidden p-3 transition-shadow duration-300 hover:shadow-xl md:min-w-[340px]"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={`/images/${item.src}`}
                  alt={item.category}
                  fill
                  sizes="340px"
                  className="object-cover sepia-[0.15] transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex items-center justify-between px-1 pt-4 pb-1">
                <span className="font-display text-2xl font-medium">{item.category}</span>
                <span className="font-display text-sm tracking-[0.2em] text-gold uppercase transition-transform group-hover:translate-x-1">
                  Explore →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer — espresso in both themes */}
      <footer className="bg-[#120d09] py-16 text-[#e6dccb]">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 md:grid-cols-3 md:px-12">
          <div className="flex flex-col items-start gap-4">
            <Wordmark size="sm" />
            <p className="text-[#e6dccb]/75">Timeless elegance and curated fashion pieces. Stay stylish, always.</p>
          </div>

          <div className="flex flex-col items-start gap-3 md:items-center">
            <h3 className="font-display text-sm font-semibold tracking-[0.3em] text-[#c9a467] uppercase">Contact Us</h3>
            <div className="flex items-center gap-2 text-[#e6dccb]/85">
              <EnvelopeIcon className="h-5 w-5" />
              <span>jana.workplace.ph@gmail.com</span>
            </div>
            <div className="flex items-center gap-2 text-[#e6dccb]/85">
              <PhoneIcon className="h-5 w-5" />
              <span>+63 948 892 9764</span>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 md:items-end">
            <h3 className="font-display text-sm font-semibold tracking-[0.3em] text-[#c9a467] uppercase">Payment Method</h3>
            <Image src="/images/GCASH.png" alt="GCash" width={120} height={48} className="h-10 w-auto rounded-sm object-contain" />
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-6xl border-t border-[#3b3026] px-6 pt-6 text-center text-sm text-[#e6dccb]/60">
          © {new Date().getFullYear()} Jana&apos;s Boutique — All rights reserved.
        </div>
      </footer>
    </div>
  );
}
