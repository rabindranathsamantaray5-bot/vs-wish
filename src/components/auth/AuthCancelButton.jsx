import { X } from "lucide-react";

export function AuthCancelButton({ href = "/", label = "Cancel and return to home" }) {
  return (
    <a
      href={href}
      aria-label={label}
      title={label}
      data-testid="auth-cancel"
      className="absolute right-5 top-5 z-10 grid h-10 w-10 place-items-center rounded-full border border-slate-200/80 bg-slate-50/90 text-slate-500 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-300 hover:bg-purple-50 hover:text-[#6d4aff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6d4aff] focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-purple-700 dark:hover:bg-purple-950/60 dark:hover:text-purple-300"
    >
      <X className="h-5 w-5" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </a>
  );
}

export default AuthCancelButton;
