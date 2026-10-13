"use client";

import { useActionState, useState } from "react";
import { deleteVillageAction, saveVillageAction, type ActionState } from "@/lib/admin/actions";
import type { Village } from "@/lib/types";
import { DeleteButton } from "./delete-button";
import { CheckboxGroup, Field, Fieldset, FormMessage, Input, LinesField, Select, TextArea } from "./fields";
import { CoverField, GalleryField } from "./image-fields";
import { MapPicker } from "./map-picker";
import { PreviewPane } from "./preview-pane";
import { RowsEditor } from "./rows-editor";
import { SlugField } from "./slug-field";
import { SubmitButton } from "./submit-button";

export interface UnionOption {
  slug: string;
  name: string;
  lat: number;
  lng: number;
}
export interface PlaceOption {
  slug: string;
  name: string;
  union: string;
  type: string;
}
export interface PersonOption {
  slug: string;
  name: string;
  category: string;
}

const statusOptions = [
  { value: "stub", label: "তথ্য যোগ হবে (শুধু নাম)" },
  { value: "partial", label: "আংশিক তথ্য" },
  { value: "complete", label: "পূর্ণাঙ্গ" },
];

// স্কুল-কলেজ-মাদ্রাসা এখন আলাদা "শিক্ষা প্রতিষ্ঠান" মেনুতে; এখানে বাকি প্রতিষ্ঠান
const institutionTypes = ["মসজিদ", "মন্দির", "স্বাস্থ্যকেন্দ্র", "অন্যান্য"].map((t) => ({
  value: t,
  label: t,
}));

export function VillageForm({
  village,
  isNew,
  unions,
  places,
  people,
}: {
  village: Village | null;
  isNew: boolean;
  unions: UnionOption[];
  places: PlaceOption[];
  people: PersonOption[];
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(saveVillageAction, null);
  const [union, setUnion] = useState(village?.union ?? unions[0]?.slug ?? "");
  const unionInfo = unions.find((u) => u.slug === union) ?? unions[0];
  const t = village?.transport;

  const placeOptions = [...places]
    .sort((a, b) => (a.union === union ? -1 : 0) - (b.union === union ? -1 : 0))
    .map((p) => ({ value: p.slug, label: p.name, hint: `${p.type} · ${unions.find((u) => u.slug === p.union)?.name ?? p.union} ইউনিয়ন` }));
  const personOptions = people.map((p) => ({ value: p.slug, label: p.name, hint: p.category }));

  const form = (
    <form action={formAction} className="grid grid-cols-1 gap-5">
      <input type="hidden" name="isNew" value={isNew ? "1" : ""} />

      <Fieldset title="মৌলিক তথ্য">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="গ্রামের নাম (বাংলা)" name="name" required>
            <Input name="name" defaultValue={village?.name} required placeholder="যেমন হরিপুর" />
          </Field>
          <Field label="ইংরেজি নাম" name="nameEn" required>
            <Input name="nameEn" defaultValue={village?.nameEn} required placeholder="Haripur" />
          </Field>
        </div>
        <SlugField initial={village?.slug} isNew={isNew} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="ইউনিয়ন" name="union" required>
            <Select name="union" value={union} onChange={setUnion} options={unions.map((u) => ({ value: u.slug, label: u.name }))} required />
          </Field>
          <Field label="তথ্যের অবস্থা" name="status" hint="পূর্ণাঙ্গ করলে হোমপেজ ও তালিকায় আগে দেখায়">
            <Select name="status" defaultValue={village?.status ?? "partial"} options={statusOptions} />
          </Field>
        </div>
        <Field label="এক লাইনের পরিচয় (ট্যাগলাইন)" name="tagline" hint="কার্ডে ও পেজের শুরুতে দেখায়">
          <Input name="tagline" defaultValue={village?.tagline} placeholder="যেমন তিতাস নদীর তীরে ঐতিহাসিক জমিদার বাড়ির গ্রাম" />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Field label="মৌজা" name="mouza">
            <Input name="mouza" defaultValue={village?.mouza} />
          </Field>
          <Field label="ওয়ার্ড নং" name="ward">
            <Input name="ward" defaultValue={village?.ward} inputMode="numeric" />
          </Field>
          <Field label="পোস্টকোড" name="postcode">
            <Input name="postcode" defaultValue={village?.postcode} placeholder="3440" />
          </Field>
          <Field label="জনসংখ্যা" name="population">
            <Input name="population" defaultValue={village?.population} inputMode="numeric" />
          </Field>
        </div>
      </Fieldset>

      <Fieldset title="পরিচয় ও ইতিহাস">
        <Field label="গ্রামের পরিচয়" name="description" hint="৩–৬ বাক্যে: কোথায়, কী আছে, কীসের জন্য পরিচিত">
          <TextArea name="description" defaultValue={village?.description} rows={6} />
        </Field>
        <Field label="ইতিহাস ও নামের উৎপত্তি" name="history">
          <TextArea name="history" defaultValue={village?.history} rows={5} />
        </Field>
      </Fieldset>

      <Fieldset title="অবস্থান" hint="মানচিত্রে গ্রামের মাঝখানে ক্লিক করুন। না দিলে ইউনিয়ন কেন্দ্র দেখানো হয়।">
        <MapPicker lat={village?.lat} lng={village?.lng} fallback={{ lat: unionInfo?.lat ?? 24.2, lng: unionInfo?.lng ?? 91.2 }} />
      </Fieldset>

      <Fieldset title="দর্শনীয় স্থান" hint="এই গ্রামের যেসব স্থান 'দর্শনীয় স্থান' তালিকায় আছে সেগুলো টিক দিন। নতুন স্থান আগে 'দর্শনীয় স্থান' মেনু থেকে যোগ করুন।">
        <CheckboxGroup name="attractions" options={placeOptions} checked={village?.attractions} />
      </Fieldset>

      <Fieldset title="বিশিষ্ট ব্যক্তি" hint="নতুন ব্যক্তি আগে 'বিশিষ্ট ব্যক্তি' মেনু থেকে যোগ করুন।">
        <CheckboxGroup name="people" options={personOptions} checked={village?.people} />
      </Fieldset>

      <Fieldset title="অন্যান্য প্রতিষ্ঠান" hint="মসজিদ, মন্দির, ক্লিনিক ইত্যাদি। স্কুল, কলেজ ও মাদ্রাসা যোগ করুন বাঁয়ের &quot;শিক্ষা প্রতিষ্ঠান&quot; মেনু থেকে, গ্রাম বাছাই করলে এই গ্রামের পেজে দেখাবে।">
        <RowsEditor
          prefix="inst"
          columns={[
            { key: "name", label: "নাম" },
            { key: "type", label: "ধরন", type: "select", options: institutionTypes },
            { key: "note", label: "নোট (ঐচ্ছিক)" },
          ]}
          initial={(village?.institutions ?? []).map((i) => ({ name: i.name, type: i.type, note: i.note ?? "" }))}
          emptyRow={{ type: "মসজিদ" }}
          addLabel="প্রতিষ্ঠান"
        />
      </Fieldset>

      <Fieldset title="হাট-বাজার">
        <RowsEditor
          prefix="mkt"
          columns={[
            { key: "name", label: "বাজারের নাম" },
            { key: "days", label: "হাটবার", placeholder: "যেমন রবি ও বুধবার" },
            { key: "note", label: "নোট (ঐচ্ছিক)" },
          ]}
          initial={(village?.markets ?? []).map((m) => ({ name: m.name, days: m.days ?? "", note: m.note ?? "" }))}
          addLabel="বাজার"
        />
      </Fieldset>

      <Fieldset title="যাতায়াত" hint="খালি রাখলে সাধারণ গাইড দেখায়। প্রতি লাইনে একটি ধাপ লিখুন।">
        <LinesField label="ঢাকা থেকে" name="fromDhaka" values={t?.fromDhaka} />
        <LinesField label="ব্রাহ্মণবাড়িয়া শহর থেকে" name="fromBrahmanbaria" values={t?.fromBrahmanbaria} />
        <LinesField label="নাসিরনগর সদর থেকে" name="fromSadar" values={t?.fromSadar} />
        <Field label="বর্ষাকালে" name="monsoon">
          <TextArea name="monsoon" defaultValue={t?.monsoon} rows={2} />
        </Field>
        <div>
          <p className="c-label">ভাড়া ও সময়</p>
          <RowsEditor
            prefix="fare"
            columns={[
              { key: "route", label: "পথ", placeholder: "সদর → গ্রাম" },
              { key: "mode", label: "বাহন", placeholder: "সিএনজি" },
              { key: "fare", label: "ভাড়া", placeholder: "৫০ টাকা" },
              { key: "time", label: "সময়", placeholder: "৩০ মিনিট" },
            ]}
            initial={(t?.fares ?? []).map((fr) => ({ route: fr.route, mode: fr.mode, fare: fr.fare, time: fr.time ?? "" }))}
            addLabel="ভাড়ার সারি"
          />
        </div>
        <LinesField label="অন্যান্য নোট" name="transportNotes" values={t?.notes} rows={2} />
      </Fieldset>

      <Fieldset title="ছবি" hint="কভার ছবি কার্ড ও পেজের শুরুতে দেখায়; গ্যালারির ছবি পেজের নিচে।">
        <CoverField current={village?.cover} />
        <GalleryField images={village?.images} />
      </Fieldset>

      <div className="sticky bottom-0 z-10 -mx-1 rounded-xl border border-ink-100 bg-white/95 p-4 shadow-[0_-4px_20px_rgba(30,36,39,0.08)] backdrop-blur">
        <div className="flex flex-wrap items-center gap-3">
          <SubmitButton label={isNew ? "গ্রাম তৈরি করুন" : "সংরক্ষণ করুন"} />
          {!isNew && village && (
            <a href={`/villages/${village.slug}`} target="_blank" rel="noopener noreferrer" className="c-btn c-btn--outline">
              সাইটে দেখুন ↗
            </a>
          )}
          <div className="flex-1">
            <FormMessage state={state} />
          </div>
        </div>
      </div>
    </form>
  );

  if (isNew || !village) return form;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,520px)]">
      <div>{form}</div>
      <div className="xl:sticky xl:top-6 xl:self-start">
        <PreviewPane href={`/villages/${village.slug}`} savedAt={state?.savedAt} />
        <div className="mt-4 c-card p-4">
          <p className="text-sm font-bold text-ink-900">গ্রাম মুছে ফেলুন</p>
          <p className="mb-3 text-xs text-ink-300">আগে এই গ্রামের সাথে যুক্ত স্থান, ব্যক্তি ও আয়োজন সরাতে হবে।</p>
          <DeleteButton action={deleteVillageAction} fields={{ slug: village.slug }} />
        </div>
      </div>
    </div>
  );
}
