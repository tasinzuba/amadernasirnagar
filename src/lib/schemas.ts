import { z } from "zod";

/**
 * কনটেন্টের zod স্কিমা। content/ ফোল্ডারের JSON ফাইল পড়ার সময় ও অ্যাডমিন প্যানেলে সেভ করার আগে
 * এগুলো দিয়ে যাচাই করা হয়। টাইপগুলো (Village, Place …) এখান থেকেই তৈরি হয় (src/lib/types.ts দেখুন)।
 */

export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug শুধু ইংরেজি ছোট হাতের অক্ষর, সংখ্যা ও হাইফেন দিয়ে লিখুন (যেমন haripur-bazar)");

const text = z.string().trim();
const optText = text.optional();
const optNum = z.number().optional();
const optInt = z.number().int().optional();
const lines = z.array(text.min(1)).optional();

export const villageStatusSchema = z.enum(["complete", "partial", "stub"]);
export const placeTypeSchema = z.enum(["ঐতিহাসিক", "প্রাকৃতিক", "ধর্মীয়", "বিনোদন"]);
export const personCategorySchema = z.enum([
  "রাজনীতিবিদ",
  "মুক্তিযোদ্ধা",
  "শিক্ষাবিদ",
  "ধর্মীয় ব্যক্তিত্ব",
  "সরকারি কর্মকর্তা",
  "সাহিত্য ও সংস্কৃতি",
  "সমাজসেবক",
  "অন্যান্য",
]);
export const institutionTypeSchema = z.enum([
  "কলেজ",
  "উচ্চ বিদ্যালয়",
  "প্রাথমিক বিদ্যালয়",
  "মাদ্রাসা",
  "মসজিদ",
  "মন্দির",
  "স্বাস্থ্যকেন্দ্র",
  "অন্যান্য",
]);

export const institutionSchema = z.object({
  name: text.min(1, "প্রতিষ্ঠানের নাম দিন"),
  type: institutionTypeSchema,
  note: optText,
});

export const marketSchema = z.object({
  name: text.min(1, "বাজারের নাম দিন"),
  days: optText,
  note: optText,
});

export const fareSchema = z.object({
  route: text.min(1),
  mode: text.min(1),
  fare: text.min(1),
  time: optText,
});

export const transportSchema = z.object({
  fromDhaka: lines,
  fromBrahmanbaria: lines,
  fromSadar: lines,
  monsoon: optText,
  fares: z.array(fareSchema).optional(),
  notes: lines,
});

export const imageItemSchema = z.object({
  src: text.min(1),
  caption: optText,
});

export const unionSchema = z.object({
  slug: slugSchema,
  name: text.min(1, "ইউনিয়নের নাম দিন"),
  nameEn: text.min(1, "ইংরেজি নাম দিন"),
  description: text.min(1, "পরিচয় লিখুন"),
  nameOrigin: optText,
  history: optText,
  area: optNum,
  population: optInt,
  households: optInt,
  mouzas: optInt,
  villageCount: optInt,
  postcode: optText,
  chairman: optText,
  lat: z.number(),
  lng: z.number(),
  rivers: lines,
  markets: lines,
  institutions: lines,
  attractions: lines,
  notablePeople: lines,
  cover: optText,
});

export const villageSchema = z.object({
  slug: slugSchema,
  name: text.min(1, "গ্রামের নাম দিন"),
  nameEn: text.min(1, "ইংরেজি নাম দিন"),
  union: slugSchema,
  status: villageStatusSchema,
  mouza: optText,
  ward: optInt,
  postcode: optText,
  population: optInt,
  households: optInt,
  tagline: optText,
  description: optText,
  history: optText,
  attractions: z.array(slugSchema).optional(),
  people: z.array(slugSchema).optional(),
  institutions: z.array(institutionSchema).optional(),
  markets: z.array(marketSchema).optional(),
  transport: transportSchema.optional(),
  cover: optText,
  images: z.array(imageItemSchema).optional(),
  lat: optNum,
  lng: optNum,
  updatedAt: optText,
});

export const placeSchema = z.object({
  slug: slugSchema,
  name: text.min(1, "স্থানের নাম দিন"),
  nameEn: optText,
  type: placeTypeSchema,
  union: slugSchema,
  village: slugSchema.optional(),
  summary: text.min(1, "সংক্ষিপ্ত পরিচয় লিখুন"),
  details: lines,
  bestTime: optText,
  tips: lines,
  cover: optText,
  images: z.array(imageItemSchema).optional(),
  lat: optNum,
  lng: optNum,
  featured: z.boolean().optional(),
});

/** শিক্ষা প্রতিষ্ঠানের ধরন (তালিকা পেজে এই ক্রমে সাজানো হয়) */
export const schoolTypeSchema = z.enum([
  "কলেজ",
  "স্কুল অ্যান্ড কলেজ",
  "উচ্চ বিদ্যালয়",
  "নিম্ন মাধ্যমিক বিদ্যালয়",
  "মাদ্রাসা",
  "কারিগরি প্রতিষ্ঠান",
  "প্রাথমিক বিদ্যালয়",
  "অন্যান্য",
]);

/** স্কুল, কলেজ, মাদ্রাসা: নিজস্ব পেজসহ (content/schools.json) */
export const schoolSchema = z.object({
  slug: slugSchema,
  name: text.min(1, "প্রতিষ্ঠানের নাম দিন"),
  nameEn: optText,
  type: schoolTypeSchema,
  /** স্তর, যেমন উচ্চ মাধ্যমিক, ডিগ্রি (পাস), দাখিল, আলিম */
  level: optText,
  /** যেমন সরকারি, এমপিওভুক্ত, বেসরকারি */
  management: optText,
  /** বালক, বালিকা বা সহশিক্ষা */
  gender: optText,
  union: slugSchema,
  village: slugSchema.optional(),
  /** গ্রাম তালিকায় না থাকলে বা আরও নির্দিষ্ট ঠিকানা */
  address: optText,
  /** প্রতিষ্ঠার সাল (খ্রিস্টাব্দ) */
  established: z.number().int().min(1600, "প্রতিষ্ঠার সাল ঠিক নেই").max(2100, "প্রতিষ্ঠার সাল ঠিক নেই").optional(),
  eiin: optText,
  founder: optText,
  /** প্রতিষ্ঠান প্রধানের নাম (প্রধান শিক্ষক বা অধ্যক্ষ) */
  head: optText,
  students: optInt,
  teachers: optInt,
  phone: optText,
  email: optText,
  website: optText,
  summary: optText,
  history: optText,
  details: lines,
  /** তথ্যসূত্র (লিংক বা লেখা) */
  sources: lines,
  cover: optText,
  images: z.array(imageItemSchema).optional(),
  lat: optNum,
  lng: optNum,
  updatedAt: optText,
});

export const personSchema = z.object({
  slug: slugSchema,
  name: text.min(1, "নাম দিন"),
  category: personCategorySchema,
  union: slugSchema.optional(),
  village: slugSchema.optional(),
  years: optText,
  summary: text.min(1, "সংক্ষিপ্ত পরিচয় লিখুন"),
  details: lines,
  image: optText,
});

export const newsPostSchema = z.object({
  slug: slugSchema,
  title: text.min(1, "শিরোনাম দিন"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "তারিখ YYYY-MM-DD আকারে দিন"),
  category: text.min(1, "বিভাগ দিন"),
  excerpt: text.min(1, "সারসংক্ষেপ লিখুন"),
  body: z.array(text.min(1)).min(1, "খবরের মূল লেখা দিন"),
  cover: optText,
});

export const eventItemSchema = z.object({
  slug: slugSchema,
  title: text.min(1, "আয়োজনের নাম দিন"),
  badge: text.min(1, "ব্যাজের লেখা দিন (যেমন মাসের নাম)"),
  when: text.min(1, "কখন হয় লিখুন"),
  place: text.min(1, "কোথায় হয় লিখুন"),
  union: slugSchema.optional(),
  village: slugSchema.optional(),
  description: text.min(1, "বিবরণ লিখুন"),
  note: optText,
  cover: optText,
});

export const emergencyContactSchema = z.object({
  name: text.min(1, "নাম দিন"),
  phone: optText,
  note: optText,
});

export const emergencyFileSchema = z.object({
  national: z.array(emergencyContactSchema),
  local: z.array(emergencyContactSchema),
});

export type Union = z.infer<typeof unionSchema>;
export type Village = z.infer<typeof villageSchema>;
export type Place = z.infer<typeof placeSchema>;
export type Person = z.infer<typeof personSchema>;
export type NewsPost = z.infer<typeof newsPostSchema>;
export type EventItem = z.infer<typeof eventItemSchema>;
export type EmergencyContact = z.infer<typeof emergencyContactSchema>;
export type EmergencyFile = z.infer<typeof emergencyFileSchema>;
export type Institution = z.infer<typeof institutionSchema>;
export type School = z.infer<typeof schoolSchema>;
export type SchoolType = z.infer<typeof schoolTypeSchema>;
export type Market = z.infer<typeof marketSchema>;
export type Fare = z.infer<typeof fareSchema>;
export type Transport = z.infer<typeof transportSchema>;
export type ImageItem = z.infer<typeof imageItemSchema>;
export type VillageStatus = z.infer<typeof villageStatusSchema>;
export type PlaceType = z.infer<typeof placeTypeSchema>;
export type PersonCategory = z.infer<typeof personCategorySchema>;
export type InstitutionType = z.infer<typeof institutionTypeSchema>;

/** zod-এর এরর তালিকাকে পড়ার মতো বাংলা বার্তায় রূপান্তর */
export function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((i) => `${i.path.length ? i.path.join(".") + ": " : ""}${i.message}`)
    .join("; ");
}
