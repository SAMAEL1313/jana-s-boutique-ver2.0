import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FaChevronDown, FaUserCircle } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";

const itemClass =
  "block w-full cursor-pointer rounded-sm px-3 py-2 text-left font-serif text-base text-ink transition-colors hover:bg-surface-2 hover:text-accent";

interface Props {
  /** Opens the shopping bag; the item is hidden when not given. */
  onOpenBag?: () => void;
}

/** Account icon with a dropdown of options for guests, customers and the admin. */
export default function AccountMenu({ onOpenBag }: Props) {
  const { currentUser, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex cursor-pointer items-center gap-1 text-ink transition-colors hover:text-gold"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <FaUserCircle size={22} />
        <FaChevronDown size={9} className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="card animate-slideDown absolute top-full right-0 z-50 mt-3 flex w-60 flex-col gap-0.5 p-2 tracking-normal normal-case shadow-xl"
        >
          <div className="mb-1 border-b border-line px-3 pt-1 pb-2">
            {currentUser ? (
              <>
                <p className="font-display text-lg leading-tight font-semibold">Hi, {currentUser.firstName}</p>
                <p className="truncate text-sm text-muted">{currentUser.email}</p>
              </>
            ) : (
              <>
                <p className="font-display text-lg leading-tight font-semibold">Welcome</p>
                <p className="text-sm text-muted">Sign in to shop and order.</p>
              </>
            )}
          </div>

          {!currentUser && (
            <>
              <Link href="/auth?form=login" onClick={close} className={itemClass} role="menuitem">
                Sign in
              </Link>
              <Link href="/auth" onClick={close} className={itemClass} role="menuitem">
                Create account
              </Link>
            </>
          )}

          {currentUser && !currentUser.isAdmin && (
            <>
              <Link href="/profile" onClick={close} className={itemClass} role="menuitem">
                My orders
              </Link>
              <Link href="/profile?tab=account" onClick={close} className={itemClass} role="menuitem">
                Account settings
              </Link>
              {onOpenBag && (
                <button
                  onClick={() => {
                    close();
                    onOpenBag();
                  }}
                  className={itemClass}
                  role="menuitem"
                >
                  My bag
                </button>
              )}
            </>
          )}

          {currentUser?.isAdmin && (
            <Link href="/admindashboard" onClick={close} className={itemClass} role="menuitem">
              Dashboard
            </Link>
          )}

          {currentUser && (
            <div className="mt-1 border-t border-line pt-1">
              <button
                onClick={() => {
                  close();
                  logout(currentUser.isAdmin ? "/adminlogin" : "/");
                }}
                className={itemClass}
                role="menuitem"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
