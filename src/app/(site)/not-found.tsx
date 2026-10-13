import { NotFoundBody } from "@/components/not-found-body";

/** ভেতরের পেজে notFound() ডাকলে: হেডার-ফুটার (site) লেআউট থেকেই আসে, তাই দ্বিতীয়বার নয় */
export default function SiteNotFound() {
  return <NotFoundBody />;
}
