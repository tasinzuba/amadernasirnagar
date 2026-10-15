"use client";

import Image from "next/image";
import { useState, type ChangeEvent } from "react";
import type { ImageItem } from "@/lib/types";

/**
 * পাঠানোর আগে ব্রাউজারেই ছবি ছোট করা: ফোনের ৫-১০ MB ছবিও কয়েকশো KB হয়ে যায়।
 * Vercel-এ একবারে ৪.৫ MB-এর বেশি পাঠানো যায় না, তাই এটা দরকার; সার্ভার পরে আবার ১৬০০px JPG বানায়।
 */
const MAX_WIDTH = 1600;
const MAX_HEIGHT = 2400;
const SEND_LIMIT = 4 * 1024 * 1024;

async function shrink(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.size < 300 * 1024) return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_WIDTH / bitmap.width, MAX_HEIGHT / bitmap.height);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.jpg`, { type: "image/jpeg", lastModified: file.lastModified });
  } catch {
    return file; // ব্রাউজার ছবিটা পড়তে না পারলে যেমন আছে তেমনই পাঠাই
  }
}

/** ফাইল বাছাইয়ের পর ছবিগুলো ছোট করে ইনপুটেই বসিয়ে দেয় */
function useShrinkOnPick() {
  const [note, setNote] = useState<string | null>(null);
  async function onChange(e: ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const picked = Array.from(input.files ?? []);
    if (!picked.length) return setNote(null);
    setNote("ছবি ছোট করা হচ্ছে…");
    const small = await Promise.all(picked.map(shrink));
    const list = new DataTransfer();
    for (const file of small) list.items.add(file);
    input.files = list.files;
    const total = small.reduce((n, file) => n + file.size, 0);
    setNote(total > SEND_LIMIT ? "একসাথে অনেক ছবি হয়ে গেছে; সেভ না হলে কয়েকটি করে আপলোড করুন।" : null);
  }
  return { onChange, note };
}

function PickNote({ note }: { note: string | null }) {
  return note ? (
    <p className="mt-1 text-xs font-semibold text-accent-700" role="status">
      {note}
    </p>
  ) : null;
}

/** কভার ছবি: বর্তমান ছবি দেখানো, মুছে ফেলা বা নতুন আপলোড */
export function CoverField({ current, label = "কভার ছবি", hint }: { current?: string; label?: string; hint?: string }) {
  const { onChange, note } = useShrinkOnPick();
  return (
    <div>
      <p className="c-label">{label}</p>
      <input type="hidden" name="coverSrc" value={current ?? ""} />
      {current ? (
        <div className="flex flex-wrap items-start gap-4">
          <Image src={current} alt="" width={240} height={180} className="h-36 w-48 rounded-xl object-cover" unoptimized />
          <div className="grid min-w-0 grid-cols-1 gap-2 text-sm">
            <p className="break-all text-ink-300">{current}</p>
            <label className="flex items-center gap-2 text-danger-600">
              <input type="checkbox" name="coverRemove" className="accent-danger-500" /> এই ছবি মুছে দিন
            </label>
            <label className="block">
              <span className="text-ink-600">নতুন ছবি দিয়ে বদলান:</span>
              <input type="file" name="coverFile" accept="image/*" onChange={onChange} className="mt-1 block w-full max-w-full text-sm" />
            </label>
          </div>
        </div>
      ) : (
        <input type="file" name="coverFile" accept="image/*" onChange={onChange} className="block w-full max-w-full text-sm" />
      )}
      <PickNote note={note} />
      <p className="mt-1 text-xs text-ink-300">{hint ?? "JPG/PNG/WebP; আপলোডের সময় ১৬০০px চওড়ায় ছোট করে JPG বানানো হয়।"}</p>
    </div>
  );
}

/** গ্যালারি: বিদ্যমান ছবির ক্যাপশন, মুছে ফেলা ও নতুন ছবি যোগ */
export function GalleryField({ images = [] }: { images?: ImageItem[] }) {
  const { onChange, note } = useShrinkOnPick();
  return (
    <div>
      <p className="c-label">গ্যালারির ছবি</p>
      {images.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {images.map((img) => (
            <div key={img.src} className="flex gap-3 rounded-xl border border-ink-100 p-2">
              <Image src={img.src} alt="" width={160} height={120} className="h-20 w-28 shrink-0 rounded-xl object-cover" unoptimized />
              <div className="min-w-0 flex-1">
                <input type="hidden" name="img.src" value={img.src} />
                <input name="img.caption" defaultValue={img.caption ?? ""} placeholder="ক্যাপশন (ঐচ্ছিক)" className="c-input" aria-label="ক্যাপশন" />
                <label className="mt-1.5 flex items-center gap-2 text-xs text-danger-600">
                  <input type="checkbox" name="imgRemove" value={img.src} className="accent-danger-500" /> মুছে দিন
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
      <label className="mt-3 block text-sm">
        <span className="text-ink-600">নতুন ছবি যোগ করুন (একসাথে একাধিক বাছাই করা যায়):</span>
        <input type="file" name="galleryFiles" accept="image/*" multiple onChange={onChange} className="mt-1 block w-full max-w-full text-sm" />
      </label>
      <PickNote note={note} />
    </div>
  );
}
