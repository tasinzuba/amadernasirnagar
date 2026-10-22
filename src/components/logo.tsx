import Image from "next/image";

/**
 * সাইটের লোগো: হাওরের দৃশ্য (সূর্য, তালগাছ, গ্রামের ঘর, নৌকায় মাঝি) গোল ফ্রেমে।
 * মাপ ক্লাস দিয়ে (যেমন h-11 w-11); id প্রপটি পুরনো কলারের সঙ্গে মিল রাখতে রাখা, ব্যবহার হয় না।
 * নামের লেখা সবসময় পাশে থাকে, তাই ছবিটি alt ছাড়া (সাজসজ্জা)।
 */
export function Logo({ className = "h-11 w-11" }: { className?: string; id?: string }) {
  return <Image src="/images/brand/logo.png" alt="" width={128} height={128} className={className} />;
}

/** পুরনো নামের সামঞ্জস্যের জন্য */
export function Emblem({ className = "h-12 w-12" }: { className?: string; id?: string }) {
  return <Logo className={className} />;
}
