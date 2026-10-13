import Image from "next/image";
import { Placeholder } from "./placeholder";

/**
 * ছবি থাকলে next/image দিয়ে দেখায়, না থাকলে প্লেসহোল্ডার।
 * className-এ অবস্থান (relative / absolute inset-0) ও মাপ (aspect-…) দিতে হয়।
 */
export function CoverImage({
  src,
  alt,
  seed,
  className = "relative",
  sizes = "(min-width: 1024px) 33vw, 100vw",
  priority = false,
  showLabel = true,
}: {
  src?: string;
  alt: string;
  seed: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  showLabel?: boolean;
}) {
  if (!src) {
    return <Placeholder seed={seed} className={className} showLabel={showLabel} />;
  }
  return (
    <div className={`overflow-hidden ${className}`}>
      <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" priority={priority} />
    </div>
  );
}
