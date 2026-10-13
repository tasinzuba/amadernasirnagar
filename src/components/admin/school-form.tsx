"use client";

import { useActionState, useState } from "react";
import { saveSchoolAction, type ActionState } from "@/lib/admin/actions";
import type { School } from "@/lib/types";
import { Field, Fieldset, Input, LinesField, Select, TextArea } from "./fields";
import { CoverField, GalleryField } from "./image-fields";
import { Layout, SaveBar, UnionVillagePicker, type UnionOption, type VillageOption } from "./item-forms";
import { MapPicker } from "./map-picker";
import { SlugField } from "./slug-field";

const schoolTypes = [
  "কলেজ",
  "স্কুল অ্যান্ড কলেজ",
  "উচ্চ বিদ্যালয়",
  "নিম্ন মাধ্যমিক বিদ্যালয়",
  "মাদ্রাসা",
  "কারিগরি প্রতিষ্ঠান",
  "প্রাথমিক বিদ্যালয়",
  "অন্যান্য",
].map((t) => ({ value: t, label: t }));
const schoolGenders = ["সহশিক্ষা", "বালক", "বালিকা"].map((g) => ({ value: g, label: g }));

/** শিক্ষা প্রতিষ্ঠান (স্কুল, কলেজ, মাদ্রাসা) যোগ ও এডিটের ফর্ম */
export function SchoolForm({ school, isNew, unions, villages }: { school: School | null; isNew: boolean; unions: UnionOption[]; villages: VillageOption[] }) {
  const [state, formAction] = useActionState<ActionState, FormData>(saveSchoolAction, null);
  const [union, setUnion] = useState(school?.union ?? unions[0]?.slug ?? "");
  const center = unions.find((u) => u.slug === union) ?? unions[0];
  const previewHref = school ? `/schools/${school.slug}` : undefined;

  const form = (
    <form action={formAction} className="grid grid-cols-1 gap-5">
      <input type="hidden" name="isNew" value={isNew ? "1" : ""} />
      <Fieldset title="মৌলিক তথ্য">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="প্রতিষ্ঠানের নাম (বাংলা)" name="name" required>
            <Input name="name" defaultValue={school?.name} required />
          </Field>
          <Field label="ইংরেজি নাম" name="nameEn" hint="slug তৈরিতে কাজে লাগে">
            <Input name="nameEn" defaultValue={school?.nameEn} />
          </Field>
        </div>
        <SlugField initial={school?.slug} isNew={isNew} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="ধরন" name="type" required>
            <Select name="type" defaultValue={school?.type ?? "উচ্চ বিদ্যালয়"} options={schoolTypes} />
          </Field>
          <Field label="স্তর" name="level" hint="যেমন দাখিল, আলিম, ডিগ্রি (পাস)">
            <Input name="level" defaultValue={school?.level} />
          </Field>
          <Field label="শিক্ষার্থীর ধরন" name="gender">
            <Select name="gender" defaultValue={school?.gender} options={schoolGenders} placeholder="উল্লেখ নেই" />
          </Field>
        </div>
        <Field label="ব্যবস্থাপনা" name="management" hint="যেমন সরকারি, এমপিওভুক্ত, বেসরকারি">
          <Input name="management" defaultValue={school?.management} />
        </Field>
        <UnionVillagePicker unions={unions} villages={villages} union={union} setUnion={setUnion} village={school?.village} unionRequired />
        <Field label="ঠিকানা" name="address" hint="গ্রাম তালিকায় না থাকলে বা আরও নির্দিষ্ট করে (যেমন পাড়া, বাজার)">
          <Input name="address" defaultValue={school?.address} />
        </Field>
      </Fieldset>
      <Fieldset title="প্রতিষ্ঠা ও পরিচালনা">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="প্রতিষ্ঠাকাল (সাল)" name="established" hint="যেমন ১৯৫২">
            <Input name="established" defaultValue={school?.established} inputMode="numeric" />
          </Field>
          <Field label="EIIN" name="eiin" hint="শিক্ষা বোর্ডের প্রতিষ্ঠান নম্বর">
            <Input name="eiin" defaultValue={school?.eiin} inputMode="numeric" />
          </Field>
          <Field label="প্রতিষ্ঠাতা" name="founder">
            <Input name="founder" defaultValue={school?.founder} />
          </Field>
          <Field label="প্রতিষ্ঠান প্রধান" name="head" hint="প্রধান শিক্ষক বা অধ্যক্ষের নাম">
            <Input name="head" defaultValue={school?.head} />
          </Field>
          <Field label="শিক্ষার্থী সংখ্যা" name="students">
            <Input name="students" defaultValue={school?.students} inputMode="numeric" />
          </Field>
          <Field label="শিক্ষক সংখ্যা" name="teachers">
            <Input name="teachers" defaultValue={school?.teachers} inputMode="numeric" />
          </Field>
        </div>
      </Fieldset>
      <Fieldset title="যোগাযোগ" hint="প্রতিষ্ঠানের নিজস্ব নম্বর বা ঠিকানা দিন; কারও ব্যক্তিগত মোবাইল নম্বর নয়">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="ফোন" name="phone">
            <Input name="phone" defaultValue={school?.phone} />
          </Field>
          <Field label="ইমেইল" name="email">
            <Input name="email" type="email" defaultValue={school?.email} />
          </Field>
          <Field label="ওয়েবসাইট" name="website">
            <Input name="website" type="url" defaultValue={school?.website} placeholder="https://" />
          </Field>
        </div>
      </Fieldset>
      <Fieldset title="বিবরণ">
        <Field label="সংক্ষিপ্ত পরিচয়" name="summary" hint="এক-দুই বাক্য; পেজের শুরুতে দেখায়">
          <TextArea name="summary" defaultValue={school?.summary} rows={2} />
        </Field>
        <Field label="ইতিহাস" name="history">
          <TextArea name="history" defaultValue={school?.history} rows={4} />
        </Field>
        <LinesField label="আরও তথ্য" name="details" values={school?.details} hint="অর্জন, সুযোগ-সুবিধা ইত্যাদি; প্রতি লাইনে একটি" rows={5} />
        <LinesField label="তথ্যসূত্র" name="sources" values={school?.sources} hint="লিংক বা উৎসের নাম; প্রতি লাইনে একটি" rows={2} />
      </Fieldset>
      <Fieldset title="অবস্থান">
        <MapPicker lat={school?.lat} lng={school?.lng} fallback={{ lat: center?.lat ?? 24.2, lng: center?.lng ?? 91.2 }} />
      </Fieldset>
      <Fieldset title="ছবি">
        <CoverField current={school?.cover} />
        <GalleryField images={school?.images} />
      </Fieldset>
      <SaveBar state={state} isNew={isNew} previewHref={previewHref} />
    </form>
  );
  return <Layout form={form} isNew={isNew} previewHref={previewHref} savedAt={state?.savedAt} deleteFields={school ? { kind: "schools", slug: school.slug } : undefined} />;
}
