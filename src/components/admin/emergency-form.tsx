"use client";

import { useActionState } from "react";
import { saveEmergencyAction, type ActionState } from "@/lib/admin/actions";
import type { EmergencyFile } from "@/lib/types";
import { Fieldset, FormMessage } from "./fields";
import { RowsEditor } from "./rows-editor";
import { SubmitButton } from "./submit-button";

const columns = [
  { key: "name", label: "নাম / সেবা" },
  { key: "phone", label: "নম্বর", placeholder: "যেমন 999 বা 01712..." },
  { key: "note", label: "নোট (ঐচ্ছিক)" },
];

export function EmergencyForm({ data }: { data: EmergencyFile }) {
  const [state, formAction] = useActionState<ActionState, FormData>(saveEmergencyAction, null);
  const toRows = (list: EmergencyFile["national"]) => list.map((c) => ({ name: c.name, phone: c.phone ?? "", note: c.note ?? "" }));
  return (
    <form action={formAction} className="grid grid-cols-1 gap-5">
      <Fieldset title="জাতীয় হেল্পলাইন" hint="সারা দেশে চালু নম্বর">
        <RowsEditor prefix="nat" columns={columns} initial={toRows(data.national)} addLabel="নম্বর" />
      </Fieldset>
      <Fieldset title="নাসিরনগরের স্থানীয় নম্বর" hint="নম্বর না থাকলে ফাঁকা রাখুন; সাইটে 'নম্বর নেই' দেখাবে">
        <RowsEditor prefix="loc" columns={columns} initial={toRows(data.local)} addLabel="নম্বর" />
      </Fieldset>
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton />
        <a href="/emergency" target="_blank" rel="noopener noreferrer" className="c-btn c-btn--outline">
          সাইটে দেখুন ↗
        </a>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
