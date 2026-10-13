import { ArrowRight, Search } from "lucide-react";

/**
 * পিল আকৃতির সার্চ (রেফারেন্সের নিউজলেটার বক্সের মতো): ভেতরে কোরাল বোতাম।
 * গ্রামের নাম লিখে /villages পেজে যায়; জাভাস্ক্রিপ্ট ছাড়াও কাজ করে।
 */
export function SearchForm({
  id = "site-search",
  className = "",
  size = "md",
  placeholder = "গ্রামের নাম লিখুন",
}: {
  id?: string;
  className?: string;
  size?: "md" | "lg";
  placeholder?: string;
}) {
  const lg = size === "lg";
  return (
    <form
      action="/villages"
      method="get"
      role="search"
      className={`flex items-center gap-2 rounded-full border border-line bg-white shadow-soft transition-[border-color,box-shadow] focus-within:border-accent-300 focus-within:ring-4 focus-within:ring-accent-500/10 ${
        lg ? "h-[4.5rem] pl-7 pr-2" : "h-14 pl-5 pr-1.5"
      } ${className}`}
    >
      <Search className="h-5 w-5 shrink-0 text-ink-300" aria-hidden="true" />
      <label htmlFor={id} className="sr-only">
        গ্রাম খুঁজুন
      </label>
      <input
        id={id}
        name="q"
        type="search"
        placeholder={placeholder}
        className="h-full min-w-0 flex-1 bg-transparent text-[1.05rem] text-ink-900 placeholder:text-ink-400 focus:outline-none"
      />
      <button
        type="submit"
        className={`inline-flex shrink-0 items-center gap-2 rounded-full bg-accent-500 font-bold text-white shadow-coral transition-colors hover:bg-accent-600 ${
          lg ? "h-14 px-7 text-[1.1875rem]" : "h-11 px-5 text-[1.05rem]"
        }`}
      >
        খুঁজুন
        <ArrowRight className="h-5 w-5" aria-hidden="true" />
      </button>
    </form>
  );
}
