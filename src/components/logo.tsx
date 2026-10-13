/** লোগো: কোরাল রঙের গোল-কোণা বর্গে সূর্য ও হাওরের ঢেউ */
export function Logo({ className = "h-11 w-11" }: { className?: string; id?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" focusable="false">
      <rect width="48" height="48" rx="13" fill="#ff3951" />
      <circle cx="24" cy="18.5" r="6.5" fill="#ffffff" />
      <path d="M11 30c4.3-3.4 8.7-3.4 13 0s8.7 3.4 13 0" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M15.5 37c2.9-2.2 5.8-2.2 8.5 0s5.6 2.2 8.5 0"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

/** পুরনো নামের সামঞ্জস্যের জন্য */
export function Emblem({ className = "h-12 w-12" }: { className?: string; id?: string }) {
  return <Logo className={className} />;
}
