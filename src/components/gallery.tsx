"use client";

import Image from "next/image";
import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import type { ImageItem } from "@/lib/types";

/** ছবির গ্যালারি: ক্লিক করলে বড় করে (লাইটবক্স) দেখা যায়; credits দিলে বড় ছবির নিচে লেখক-লাইসেন্স দেখায় */
export function Gallery({
  images,
  altBase,
  credits,
}: {
  images: ImageItem[];
  altBase: string;
  /** ছবির পথ → "ছবি: লেখক, লাইসেন্স" */
  credits?: Record<string, string>;
}) {
  const [index, setIndex] = useState(-1);
  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((img, i) => (
          <button
            key={img.src}
            type="button"
            onClick={() => setIndex(i)}
            className="group relative aspect-[4/3] overflow-hidden rounded-md bg-ink-100 text-left"
            aria-label={`${img.caption ?? altBase} বড় করে দেখুন`}
          >
            <Image
              src={img.src}
              alt={img.caption ?? `${altBase} ছবি ${i + 1}`}
              fill
              sizes="(min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {img.caption && (
              <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent px-3 pb-2 pt-6 text-xs text-white">
                {img.caption}
              </span>
            )}
          </button>
        ))}
      </div>
      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={images.map((img) => ({
          src: img.src,
          description: [img.caption, credits?.[img.src]].filter(Boolean).join(" · ") || undefined,
        }))}
        plugins={[Captions]}
      />
    </>
  );
}
