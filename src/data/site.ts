export const site = {
  name: "আমাদের নাসিরনগর",
  nameEn: "Amader Nasirnagar",
  tagline: "নাসিরনগরের ইতিহাস, ঐতিহ্য ও গ্রামের পরিচিতি",
  description:
    "হাওর-বেষ্টিত নাসিরনগরের ১৩টি ইউনিয়নের গ্রাম, ইতিহাস, ঐতিহ্য, দর্শনীয় স্থান, কৃতী ব্যক্তিত্ব ও স্থানীয় সংস্কৃতির তথ্য জানুন এক প্ল্যাটফর্মে।",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  /** হেডারের প্রধান মেনু */
  nav: [
    { href: "/villages", label: "গ্রাম" },
    { href: "/unions", label: "ইউনিয়ন" },
    { href: "/places", label: "দর্শনীয় স্থান" },
    { href: "/people", label: "বিশিষ্ট ব্যক্তি" },
    { href: "/news", label: "খবর" },
  ],
  /** "আরও" ড্রপডাউন, মোবাইল মেনু ও ফুটারের সহায়ক লিংক */
  secondaryNav: [
    { href: "/schools", label: "শিক্ষা প্রতিষ্ঠান", description: "স্কুল, কলেজ ও মাদ্রাসার নাম, ছবি ও প্রতিষ্ঠাকাল" },
    { href: "/events", label: "উৎসব ও মেলা", description: "লোকজ উৎসব, ধর্মীয় আয়োজন ও ঐতিহ্যবাহী মেলা" },
    { href: "/transport", label: "যাতায়াত গাইড", description: "নাসিরনগরে আসা ও স্থানীয় চলাচলের তথ্য" },
    { href: "/upazila", label: "উপজেলা পরিচিতি", description: "ইতিহাস, ভূগোল, নদ-নদী ও জনজীবন" },
    { href: "/map", label: "মানচিত্র", description: "মানচিত্রে ইউনিয়ন ও গ্রামের অবস্থান" },
    { href: "/emergency", label: "জরুরি নম্বর", description: "জরুরি সেবা ও গুরুত্বপূর্ণ যোগাযোগ" },
    { href: "/about", label: "সম্পর্কে", description: "আমাদের উদ্দেশ্য ও উদ্যোগের পরিচয়" },
  ],
  /** সামাজিক মাধ্যমের লিংক; খালি থাকলে ফুটারে দেখায় না */
  social: [] as { label: string; href: string }[],
  upazila: {
    name: "নাসিরনগর",
    district: "ব্রাহ্মণবাড়িয়া",
    division: "চট্টগ্রাম",
    /** বর্গ কিমি (বিবিএস ২০২২) */
    areaKm2: 311.66,
    population2022: 346774,
    literacy2022: 61.97,
    unions: 13,
    villagesOfficial: 128,
    mouzas: 96,
    /** উপজেলা পোর্টাল অনুযায়ী; ফান্দাউক ৩৪৪১ */
    postcode: "3440",
    lat: 24.2067,
    lng: 91.21,
    /** উপজেলা সদরের স্থানাঙ্ক (দূরত্ব হিসাবের জন্য) */
    sadar: { lat: 24.192806, lng: 91.194611 },
    distanceFromDistrictKm: 28,
  },
};
