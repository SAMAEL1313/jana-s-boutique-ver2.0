import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FaChevronDown, FaSearch, FaShoppingBag, FaUserCircle } from "react-icons/fa";
import CartSidebar from "@/components/CartSidebar";
import SearchSideBar from "@/components/SearchSideBar";
import ThemeToggle from "@/components/ThemeToggle";
import Wordmark from "@/components/Wordmark";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

const linkClass = "link-underline transition-colors hover:text-gold";
const iconClass = "cursor-pointer text-ink transition-colors hover:text-gold";

interface DropdownProps {
  label: string;
  items: { href: string; label: string }[];
}

function NavDropdown({ label, items }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  const toggle = () => {
    if (open) {
      setClosing(true);
      setTimeout(() => {
        setOpen(false);
        setClosing(false);
      }, 300);
    } else {
      setOpen(true);
    }
  };

  return (
    <div className="relative">
      <button className={`${linkClass} flex cursor-pointer items-center gap-1.5 uppercase`} onClick={toggle}>
        {label}
        <FaChevronDown size={9} className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>

      {(open || closing) && (
        <div
          className={`card absolute top-full left-1/2 z-50 mt-3 w-44 -translate-x-1/2 overflow-hidden py-1 shadow-xl ${closing ? "animate-slideUp" : "animate-slideDown"}`}
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-4 py-2 font-serif text-base tracking-normal normal-case transition-colors hover:bg-surface-2 hover:text-gold"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { cartItems } = useCart();
  const isAdmin = !!currentUser?.isAdmin;

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Collapse the wordmark when scrolling down, show it again near the top.
  const [showTitle, setShowTitle] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const threshold = 150;
    const handleScroll = () => {
      const current = window.scrollY;
      if (current > lastScrollY.current) setShowTitle(false);
      else if (current < threshold) setShowTitle(true);
      lastScrollY.current = current;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleProfileClick = () => {
    if (!currentUser) router.push("/auth");
    else router.push(isAdmin ? "/admindashboard" : "/profile");
  };

  return (
    <nav className="fixed top-0 left-0 z-50 w-full border-b border-line bg-paper/90 text-ink backdrop-blur-md transition-colors">
      {/* Wordmark */}
      <div
        className={`flex justify-center overflow-hidden transition-all duration-500 ${showTitle ? "max-h-24 pt-5 opacity-100" : "max-h-0 pt-0 opacity-0"}`}
      >
        <Link href={isAdmin ? "/admindashboard" : "/"} aria-label="Jana's Boutique home">
          <Wordmark />
        </Link>
      </div>

      {/* Main bar */}
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4">
        <div className="flex w-28 items-center">
          <FaSearch size={18} className={iconClass} onClick={() => setIsSearchOpen(true)} aria-label="Search" />
        </div>

        <div className="flex items-center gap-8 font-display text-sm font-semibold tracking-[0.2em] uppercase">
          <Link href="/tops" className={linkClass}>
            Tops
          </Link>
          <Link href="/bottoms" className={linkClass}>
            Bottoms
          </Link>
          <NavDropdown
            label="Shoes"
            items={[
              { href: "/shoes/sandals", label: "Sandals" },
              { href: "/shoes/heels", label: "Heels" },
              { href: "/shoes/flats", label: "Flats" },
            ]}
          />
          <NavDropdown
            label="Accessories"
            items={[
              { href: "/accessories/handbags", label: "Handbags" },
              { href: "/accessories/earrings", label: "Earrings" },
              { href: "/accessories/necklace", label: "Necklaces" },
              { href: "/accessories/bracelets", label: "Bracelets" },
              { href: "/accessories/rings", label: "Rings" },
            ]}
          />
          <Link href="/dresses" className={linkClass}>
            Dresses
          </Link>
          <Link href="/perfumes" className={linkClass}>
            Perfumes
          </Link>
        </div>

        <div className="flex w-28 items-center justify-end gap-5">
          <ThemeToggle />
          <FaUserCircle size={22} className={iconClass} onClick={handleProfileClick} aria-label="Account" />
          {!isAdmin && (
            <button className="relative cursor-pointer" onClick={() => setIsCartOpen(true)} aria-label="Open cart">
              <FaShoppingBag size={20} className={iconClass} />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-accent px-1 text-[10px] text-accent-ink">
                  {cartItems.length}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {isCartOpen && !isAdmin && <CartSidebar onClose={() => setIsCartOpen(false)} />}
      {isSearchOpen && <SearchSideBar onClose={() => setIsSearchOpen(false)} />}
    </nav>
  );
}
