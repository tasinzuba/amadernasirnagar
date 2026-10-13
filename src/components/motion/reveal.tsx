"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

/*
 * সাইটের একমাত্র নিজে-থেকে-চলা অ্যানিমেশন: হোমপেজের হিরো লেখা পাতা খোলার সময় একে একে ভেসে ওঠে।
 * স্ক্রল-অ্যানিমেশন ইচ্ছা করে রাখা হয়নি; বাকি গতি শুধু ব্যবহারকারীর কাজের জবাবে (মেনু, ড্রপডাউন)।
 * data-reveal: জাভাস্ক্রিপ্ট বন্ধ থাকলে layout.tsx-এর <noscript> নিয়ম এগুলো দৃশ্যমান রাখে।
 */
export function Stagger({
  children,
  className = "",
  stagger = 0.12,
  delay = 0.05,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}) {
  return (
    <motion.div
      data-reveal
      className={className}
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = "", y = 24 }: { children: ReactNode; className?: string; y?: number }) {
  return (
    <motion.div
      data-reveal
      className={className}
      variants={{ hidden: { opacity: 0, y }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } } }}
    >
      {children}
    </motion.div>
  );
}
