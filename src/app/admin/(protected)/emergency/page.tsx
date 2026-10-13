import { AdminHeader } from "@/components/admin/admin-shell";
import { EmergencyForm } from "@/components/admin/emergency-form";
import { data } from "@/lib/data";

export default async function AdminEmergencyPage() {
  const db = await data();
  return (
    <>
      <AdminHeader title="জরুরি নম্বর" intro="জাতীয় হেল্পলাইন ও নাসিরনগরের স্থানীয় নম্বর। নম্বর ইংরেজি বা বাংলা অঙ্কে লিখতে পারেন।" />
      <EmergencyForm data={db.getEmergency()} />
    </>
  );
}
