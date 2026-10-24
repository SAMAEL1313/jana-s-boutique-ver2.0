import { useEffect, useRef, useState } from "react";
import { BsPerson } from "react-icons/bs";
import { FaChevronDown } from "react-icons/fa";

interface Props {
  email: string | undefined;
  onSignOut: () => void;
}

/** Person icon with a dropdown showing the account email and a sign-out button. */
export default function ProfileDropdown({ email, onSignOut }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex cursor-pointer items-center gap-1.5 text-ink transition-colors hover:text-gold"
        aria-label="Account menu"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line">
          <BsPerson size={18} />
        </span>
        <FaChevronDown size={10} className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="card animate-slideDown absolute top-full right-0 z-50 mt-3 flex w-64 flex-col gap-1 p-2 shadow-xl">
          <div className="flex items-center gap-2 border-b border-line px-3 py-2 text-sm text-muted">
            <BsPerson size={16} />
            <span className="truncate">{email}</span>
          </div>
          <button
            onClick={onSignOut}
            className="cursor-pointer rounded-sm px-3 py-2 text-left text-ink transition-colors hover:bg-surface-2 hover:text-accent"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
