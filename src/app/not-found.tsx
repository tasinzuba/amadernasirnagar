import { NotFoundBody } from "@/components/not-found-body";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/** কোনো রুটের সঙ্গে না মেলা ঠিকানা: রুট লেআউটে হেডার-ফুটার নেই, তাই এখানে নিজেই বসানো */
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <NotFoundBody />
      </main>
      <SiteFooter />
    </>
  );
}
