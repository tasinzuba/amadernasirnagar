/**
 * আমাদের নাসিরনগর — ডেটা টাইপ।
 * টাইপগুলো src/lib/schemas.ts-এর zod স্কিমা থেকে তৈরি, যাতে JSON যাচাই ও টাইপ এক জায়গা থেকে আসে।
 */

import type { Person } from "./schemas";

export type Slug = string;

/** ছবির আসল মাপ (পিক্সেলে) */
export interface ImageSize {
  width: number;
  height: number;
}

export type {
  Union as UnionInfo,
  Village,
  Place,
  Person,
  School,
  SchoolType,
  NewsPost,
  EventItem,
  EmergencyContact,
  EmergencyFile,
  Institution,
  Market,
  Fare,
  Transport,
  ImageItem,
  VillageStatus,
  PlaceType,
  PersonCategory,
  InstitutionType,
} from "./schemas";

/** ছবির পথ আর আসল মাপসহ ব্যক্তি (ছবি যেমন আছে তেমন দেখানোর জন্য) */
export type PersonWithPhoto = Person & { imageSize?: ImageSize };
