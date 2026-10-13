"use client";

import { useActionState, useState } from "react";
import {
  deleteItemAction,
  saveEventAction,
  saveNewsAction,
  savePersonAction,
  savePlaceAction,
  saveUnionAction,
  type ActionState,
} from "@/lib/admin/actions";
import type { EventItem, NewsPost, Person, Place, UnionInfo } from "@/lib/types";
import { DeleteButton } from "./delete-button";
import { Field, Fieldset, FormMessage, Input, LinesField, Select, TextArea } from "./fields";
import { CoverField, GalleryField } from "./image-fields";
import { MapPicker } from "./map-picker";
import { PreviewPane } from "./preview-pane";
import { SlugField } from "./slug-field";
import { SubmitButton } from "./submit-button";

export interface UnionOption {
  slug: string;
  name: string;
  lat: number;
  lng: number;
}
export interface VillageOption {
  slug: string;
  name: string;
  union: string;
}

const placeTypes = ["ঐতিহাসিক", "প্রাকৃতিক", "ধর্মীয়", "বিনোদন"].map((t) => ({ value: t, label: t }));
const personCategories = [
  "রাজনীতিবিদ",
  "মুক্তিযোদ্ধা",
  "শিক্ষাবিদ",
  "ধর্মীয় ব্যক্তিত্ব",
  "সরকারি কর্মকর্তা",
  "সাহিত্য ও সংস্কৃতি",
  "সমাজসেবক",
  "অন্যান্য",
].map((c) => ({ value: c, label: c }));

export function SaveBar({ state, isNew, previewHref }: { state: ActionState; isNew: boolean; previewHref?: string }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-1 rounded-xl border border-ink-100 bg-white/95 p-4 shadow-[0_-4px_20px_rgba(30,36,39,0.08)] backdrop-blur">
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton label={isNew ? "তৈরি করুন" : "সংরক্ষণ করুন"} />
        {!isNew && previewHref && (
          <a href={previewHref} target="_blank" rel="noopener noreferrer" className="c-btn c-btn--outline">
            সাইটে দেখুন ↗
          </a>
        )}
        <div className="flex-1">
          <FormMessage state={state} />
        </div>
      </div>
    </div>
  );
}

export function Layout({
  form,
  isNew,
  previewHref,
  savedAt,
  deleteFields,
}: {
  form: React.ReactNode;
  isNew: boolean;
  previewHref?: string;
  savedAt?: number;
  deleteFields?: Record<string, string>;
}) {
  if (isNew || !previewHref) return <>{form}</>;
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,480px)]">
      <div>{form}</div>
      <div className="xl:sticky xl:top-6 xl:self-start">
        <PreviewPane href={previewHref} savedAt={savedAt} />
        {deleteFields && (
          <div className="mt-4 c-card p-4">
            <p className="mb-3 text-sm font-bold text-ink-900">মুছে ফেলুন</p>
            <DeleteButton action={deleteItemAction} fields={deleteFields} />
          </div>
        )}
      </div>
    </div>
  );
}

/** ইউনিয়ন ও গ্রাম বাছাই: ইউনিয়ন বদলালে গ্রামের তালিকা সেই ইউনিয়নের হয় */
export function UnionVillagePicker({
  unions,
  villages,
  union,
  setUnion,
  village,
  unionRequired,
}: {
  unions: UnionOption[];
  villages: VillageOption[];
  union: string;
  setUnion: (v: string) => void;
  village?: string;
  unionRequired?: boolean;
}) {
  const villageOptions = villages.filter((v) => !union || v.union === union).map((v) => ({ value: v.slug, label: v.name }));
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label="ইউনিয়ন" name="union" required={unionRequired}>
        <Select
          name="union"
          value={union}
          onChange={setUnion}
          options={unions.map((u) => ({ value: u.slug, label: u.name }))}
          placeholder={unionRequired ? undefined : "নির্দিষ্ট নয়"}
          required={unionRequired}
        />
      </Field>
      <Field label="গ্রাম" name="village" hint="জানা থাকলে বাছাই করুন">
        <Select name="village" defaultValue={village} options={villageOptions} placeholder="নির্দিষ্ট নয়" />
      </Field>
    </div>
  );
}

/* ---------- দর্শনীয় স্থান ---------- */

export function PlaceForm({ place, isNew, unions, villages }: { place: Place | null; isNew: boolean; unions: UnionOption[]; villages: VillageOption[] }) {
  const [state, formAction] = useActionState<ActionState, FormData>(savePlaceAction, null);
  const [union, setUnion] = useState(place?.union ?? unions[0]?.slug ?? "");
  const center = unions.find((u) => u.slug === union) ?? unions[0];

  const form = (
    <form action={formAction} className="grid grid-cols-1 gap-5">
      <input type="hidden" name="isNew" value={isNew ? "1" : ""} />
      <Fieldset title="মৌলিক তথ্য">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="স্থানের নাম (বাংলা)" name="name" required>
            <Input name="name" defaultValue={place?.name} required />
          </Field>
          <Field label="ইংরেজি নাম" name="nameEn">
            <Input name="nameEn" defaultValue={place?.nameEn} />
          </Field>
        </div>
        <SlugField initial={place?.slug} isNew={isNew} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="ধরন" name="type" required>
            <Select name="type" defaultValue={place?.type ?? "ঐতিহাসিক"} options={placeTypes} />
          </Field>
          <div className="flex items-end">
            <label className="flex items-center gap-2 py-2.5 text-sm font-semibold text-ink-900">
              <input type="checkbox" name="featured" defaultChecked={place?.featured} className="accent-brand-500" /> হোমপেজে দেখান (featured)
            </label>
          </div>
        </div>
        <UnionVillagePicker unions={unions} villages={villages} union={union} setUnion={setUnion} village={place?.village} unionRequired />
      </Fieldset>
      <Fieldset title="বিবরণ">
        <Field label="সংক্ষিপ্ত পরিচয়" name="summary" required hint="এক-দুই বাক্য; কার্ডে দেখায়">
          <TextArea name="summary" defaultValue={place?.summary} rows={2} required />
        </Field>
        <LinesField label="বিস্তারিত" name="details" values={place?.details} hint="প্রতি লাইনে একটি অনুচ্ছেদ বা তথ্য" rows={6} />
        <Field label="কখন যাবেন" name="bestTime">
          <Input name="bestTime" defaultValue={place?.bestTime} placeholder="যেমন নভেম্বর থেকে ফেব্রুয়ারি" />
        </Field>
        <LinesField label="ভ্রমণ টিপস" name="tips" values={place?.tips} rows={3} />
      </Fieldset>
      <Fieldset title="অবস্থান">
        <MapPicker lat={place?.lat} lng={place?.lng} fallback={{ lat: center?.lat ?? 24.2, lng: center?.lng ?? 91.2 }} />
      </Fieldset>
      <Fieldset title="ছবি">
        <CoverField current={place?.cover} />
        <GalleryField images={place?.images} />
      </Fieldset>
      <SaveBar state={state} isNew={isNew} previewHref={place ? `/places/${place.slug}` : undefined} />
    </form>
  );
  return <Layout form={form} isNew={isNew} previewHref={place ? `/places/${place.slug}` : undefined} savedAt={state?.savedAt} deleteFields={place ? { kind: "places", slug: place.slug } : undefined} />;
}

/* ---------- বিশিষ্ট ব্যক্তি ---------- */

export function PersonForm({ person, isNew, unions, villages }: { person: Person | null; isNew: boolean; unions: UnionOption[]; villages: VillageOption[] }) {
  const [state, formAction] = useActionState<ActionState, FormData>(savePersonAction, null);
  const [union, setUnion] = useState(person?.union ?? "");
  const form = (
    <form action={formAction} className="grid grid-cols-1 gap-5">
      <input type="hidden" name="isNew" value={isNew ? "1" : ""} />
      <Fieldset title="পরিচয়">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="নাম" name="name" required>
            <Input name="name" defaultValue={person?.name} required />
          </Field>
          <Field label="ইংরেজি নাম (slug তৈরির জন্য)" name="nameEn" hint="সাইটে দেখায় না">
            <Input name="nameEn" defaultValue="" />
          </Field>
        </div>
        <SlugField initial={person?.slug} isNew={isNew} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="শ্রেণি" name="category" required>
            <Select name="category" defaultValue={person?.category ?? "অন্যান্য"} options={personCategories} />
          </Field>
          <Field label="জীবনকাল" name="years" hint="যেমন ১৮৬২–১৯২২ বা জন্ম ১৯২০">
            <Input name="years" defaultValue={person?.years} />
          </Field>
        </div>
        <UnionVillagePicker unions={unions} villages={villages} union={union} setUnion={setUnion} village={person?.village} />
        <Field label="সংক্ষিপ্ত পরিচয়" name="summary" required>
          <TextArea name="summary" defaultValue={person?.summary} rows={3} required />
        </Field>
        <LinesField label="বিস্তারিত জীবনী" name="details" values={person?.details} hint="প্রতি লাইনে একটি অনুচ্ছেদ" rows={6} />
      </Fieldset>
      <Fieldset title="ছবি" hint="বর্গাকার করে ৮০০×৮০০ পিক্সেলে সংরক্ষিত হয়; জীবিত ব্যক্তির ছবি দেওয়ার আগে অনুমতি নিন।">
        <CoverField current={person?.image} label="ছবি" hint="ছবি যেমন আছে তেমনই দেখায়: পোর্ট্রেট, কাটা বা বড় করা হয় না। খুব বড় হলে ৮০০px চওড়া পর্যন্ত ছোট করে JPG বানানো হয়।" />
      </Fieldset>
      <SaveBar state={state} isNew={isNew} previewHref="/people" />
    </form>
  );
  return <Layout form={form} isNew={isNew} previewHref={person ? "/people" : undefined} savedAt={state?.savedAt} deleteFields={person ? { kind: "people", slug: person.slug } : undefined} />;
}

/* ---------- খবর ---------- */

export function NewsForm({ post, isNew }: { post: NewsPost | null; isNew: boolean }) {
  const [state, formAction] = useActionState<ActionState, FormData>(saveNewsAction, null);
  const form = (
    <form action={formAction} className="grid grid-cols-1 gap-5">
      <input type="hidden" name="isNew" value={isNew ? "1" : ""} />
      <Fieldset title="খবর">
        <Field label="শিরোনাম" name="title" required>
          <Input name="title" defaultValue={post?.title} required />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="ইংরেজি শিরোনাম (slug তৈরির জন্য)" name="nameEn" hint="সাইটে দেখায় না">
            <Input name="nameEn" defaultValue="" />
          </Field>
          <Field label="তারিখ" name="date" required hint="YYYY-MM-DD">
            <Input name="date" type="date" defaultValue={post?.date} required />
          </Field>
          <Field label="বিভাগ" name="category" required>
            <Input name="category" defaultValue={post?.category ?? "ঘোষণা"} required placeholder="ঘোষণা / আহ্বান / খবর" />
          </Field>
        </div>
        <SlugField initial={post?.slug} isNew={isNew} />
        <Field label="সারসংক্ষেপ" name="excerpt" required hint="কার্ড ও পেজের শুরুতে দেখায়">
          <TextArea name="excerpt" defaultValue={post?.excerpt} rows={2} required />
        </Field>
        <Field label="মূল লেখা" name="body" required hint="অনুচ্ছেদের মাঝে একটি ফাঁকা লাইন রাখুন">
          <TextArea name="body" defaultValue={(post?.body ?? []).join("\n\n")} rows={12} required />
        </Field>
      </Fieldset>
      <Fieldset title="ছবি">
        <CoverField current={post?.cover} />
      </Fieldset>
      <SaveBar state={state} isNew={isNew} previewHref={post ? `/news/${post.slug}` : undefined} />
    </form>
  );
  return <Layout form={form} isNew={isNew} previewHref={post ? `/news/${post.slug}` : undefined} savedAt={state?.savedAt} deleteFields={post ? { kind: "news", slug: post.slug } : undefined} />;
}

/* ---------- উৎসব ---------- */

export function EventForm({ event, isNew, unions, villages }: { event: EventItem | null; isNew: boolean; unions: UnionOption[]; villages: VillageOption[] }) {
  const [state, formAction] = useActionState<ActionState, FormData>(saveEventAction, null);
  const [union, setUnion] = useState(event?.union ?? "");
  const form = (
    <form action={formAction} className="grid grid-cols-1 gap-5">
      <input type="hidden" name="isNew" value={isNew ? "1" : ""} />
      <Fieldset title="আয়োজন">
        <Field label="নাম" name="title" required>
          <Input name="title" defaultValue={event?.title} required />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="ইংরেজি নাম (slug তৈরির জন্য)" name="nameEn" hint="সাইটে দেখায় না">
            <Input name="nameEn" defaultValue="" />
          </Field>
          <Field label="ব্যাজের লেখা" name="badge" required hint="কার্ডের কোণে; যেমন মাসের নাম">
            <Input name="badge" defaultValue={event?.badge} required placeholder="আষাঢ়" />
          </Field>
          <Field label="কখন হয়" name="when" required>
            <Input name="when" defaultValue={event?.when} required placeholder="আষাঢ় মাস (জুন–জুলাই), প্রতি বছর" />
          </Field>
        </div>
        <SlugField initial={event?.slug} isNew={isNew} />
        <Field label="কোথায় হয়" name="place" required>
          <Input name="place" defaultValue={event?.place} required />
        </Field>
        <UnionVillagePicker unions={unions} villages={villages} union={union} setUnion={setUnion} village={event?.village} />
        <Field label="বিবরণ" name="description" required>
          <TextArea name="description" defaultValue={event?.description} rows={4} required />
        </Field>
        <Field label="নোট" name="note" hint="যেমন: এ বছরের তারিখ যোগ হবে">
          <Input name="note" defaultValue={event?.note} />
        </Field>
      </Fieldset>
      <Fieldset title="ছবি">
        <CoverField current={event?.cover} />
      </Fieldset>
      <SaveBar state={state} isNew={isNew} previewHref="/events" />
    </form>
  );
  return <Layout form={form} isNew={isNew} previewHref={event ? `/events#${event.slug}` : undefined} savedAt={state?.savedAt} deleteFields={event ? { kind: "events", slug: event.slug } : undefined} />;
}

/* ---------- ইউনিয়ন ---------- */

export function UnionForm({ union }: { union: UnionInfo }) {
  const [state, formAction] = useActionState<ActionState, FormData>(saveUnionAction, null);
  const form = (
    <form action={formAction} className="grid grid-cols-1 gap-5">
      <input type="hidden" name="slug" value={union.slug} />
      <Fieldset title="মৌলিক তথ্য">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="নাম (বাংলা)" name="name" required>
            <Input name="name" defaultValue={union.name} required />
          </Field>
          <Field label="ইংরেজি নাম" name="nameEn" required>
            <Input name="nameEn" defaultValue={union.nameEn} required />
          </Field>
        </div>
        <Field label="পরিচয়" name="description" required>
          <TextArea name="description" defaultValue={union.description} rows={4} required />
        </Field>
        <Field label="নামের উৎপত্তি" name="nameOrigin">
          <TextArea name="nameOrigin" defaultValue={union.nameOrigin} rows={2} />
        </Field>
        <Field label="ইতিহাস" name="history">
          <TextArea name="history" defaultValue={union.history} rows={3} />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="চেয়ারম্যান" name="chairman">
            <Input name="chairman" defaultValue={union.chairman} />
          </Field>
          <Field label="পোস্টকোড" name="postcode">
            <Input name="postcode" defaultValue={union.postcode} />
          </Field>
          <Field label="আয়তন (বর্গ কিমি)" name="area">
            <Input name="area" defaultValue={union.area} inputMode="decimal" />
          </Field>
          <Field label="জনসংখ্যা (২০১১)" name="population">
            <Input name="population" defaultValue={union.population} inputMode="numeric" />
          </Field>
          <Field label="খানা" name="households">
            <Input name="households" defaultValue={union.households} inputMode="numeric" />
          </Field>
          <Field label="মৌজা" name="mouzas">
            <Input name="mouzas" defaultValue={union.mouzas} inputMode="numeric" />
          </Field>
        </div>
        <input type="hidden" name="villageCount" value={union.villageCount ?? ""} />
      </Fieldset>
      <Fieldset title="অবস্থান (ইউনিয়ন কেন্দ্র)">
        <MapPicker lat={union.lat} lng={union.lng} fallback={{ lat: union.lat, lng: union.lng }} fallbackLabel="আগের মান" />
      </Fieldset>
      <Fieldset title="তালিকা" hint="প্রতি লাইনে একটি">
        <LinesField label="নদী ও খাল" name="rivers" values={union.rivers} />
        <LinesField label="হাট-বাজার" name="markets" values={union.markets} />
        <LinesField label="শিক্ষা প্রতিষ্ঠান (সারাংশ)" name="institutions" values={union.institutions} hint="প্রতি লাইনে একটি। শুধু তখনই দেখায় যখন &quot;শিক্ষা প্রতিষ্ঠান&quot; মেনুতে এই ইউনিয়নের কোনো প্রতিষ্ঠান নেই" />
        <LinesField label="দর্শনীয় স্থান (নাম)" name="attractions" values={union.attractions} />
        <LinesField label="কৃতী ব্যক্তিত্ব (নাম)" name="notablePeople" values={union.notablePeople} />
      </Fieldset>
      <SaveBar state={state} isNew={false} previewHref={`/unions/${union.slug}`} />
    </form>
  );
  return <Layout form={form} isNew={false} previewHref={`/unions/${union.slug}`} savedAt={state?.savedAt} />;
}
