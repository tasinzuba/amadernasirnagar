"use client";

import { MotionConfig } from "motion/react";
import NextTopLoader from "nextjs-toploader";
import { Suspense, type ReactNode } from "react";
import { BackToTop } from "./back-to-top";

/** পুরো সাইটের ক্লায়েন্ট-সাইড সুবিধা: পাতা বদলের লোডিং বার, অ্যানিমেশন সেটিং, উপরে যাওয়ার বোতাম */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <Suspense fallback={null}>
        <NextTopLoader color="#ff3951" height={3} showSpinner={false} shadow="0 0 10px #ff3951, 0 0 5px #ff3951" />
      </Suspense>
      {children}
      <BackToTop />
    </MotionConfig>
  );
}
