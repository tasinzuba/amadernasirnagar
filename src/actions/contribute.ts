"use server";

import { addSubmission } from "@/lib/admin/submissions";

export type ContributeState = { ok: boolean; message: string } | null;

const MAX_DETAILS = 5000;

/**
 * "তথ্য দিন" ফর্মের সার্ভার অ্যাকশন।
 * DATABASE_URL থাকলে জমা পড়া তথ্য ডেটাবেসের submissions টেবিলে, না থাকলে প্রজেক্টের submissions/ ফোল্ডারে রাখা হয়।
 * অ্যাডমিন প্যানেলের "জমা পড়া তথ্য" পেজে সেগুলো দেখা যায়।
 */
export async function submitContribution(_prev: ContributeState, formData: FormData): Promise<ContributeState> {
  const get = (key: string) => String(formData.get(key) ?? "").trim();

  // স্প্যাম বট ধরার ফাঁদ: এই ফিল্ড মানুষ দেখতে পায় না
  if (get("website")) {
    return { ok: true, message: "ধন্যবাদ!" };
  }

  const data = {
    name: get("name"),
    contact: get("contact"),
    union: get("union"),
    village: get("village"),
    kind: get("kind"),
    details: get("details"),
    links: get("links"),
  };

  if (!data.name || !data.village || !data.details) {
    return { ok: false, message: "আপনার নাম, গ্রামের নাম ও বিস্তারিত তথ্য পূরণ করুন।" };
  }
  if (data.details.length > MAX_DETAILS) {
    return { ok: false, message: "বিস্তারিত তথ্য ৫,০০০ অক্ষরের মধ্যে লিখুন। প্রয়োজনে আলাদাভাবে আরও তথ্য পাঠাতে পারেন।" };
  }

  try {
    await addSubmission(data);
  } catch (error) {
    // লগে পুরো তথ্য রেখে দিই, যাতে প্রয়োজনে সেখান থেকে উদ্ধার করা যায়
    console.error("[contribute] সংরক্ষণ ব্যর্থ:", error, JSON.stringify(data));
    return { ok: false, message: "দুঃখিত, এই মুহূর্তে তথ্য জমা নেওয়া যাচ্ছে না। কিছুক্ষণ পর আবার চেষ্টা করুন।" };
  }

  return {
    ok: true,
    message: "আপনার তথ্য জমা হয়েছে। ধন্যবাদ! যাচাইয়ের পর প্রাসঙ্গিক তথ্য ওয়েবসাইটে প্রকাশ করা হবে।",
  };
}
