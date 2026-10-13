/**
 * ছবি না থাকলে টাইটেলবার ও ফুটারের পেছনে হাওর, নদী আর গ্রামের আঁকা দৃশ্য (গোধূলি)।
 * public/images/hero.jpg রাখলে টাইটেলবারে এর বদলে সেই ছবি দেখাবে।
 */
export function HeroScene({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1600 640"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* y2=0.66: গ্রেডিয়েন্ট দিগন্তে (y≈420) শেষ হয়, তাই গোধূলির সোনালি আভা পানির ঠিক ওপরে দেখা যায় */}
        <linearGradient id="hs-sky" x1="0" y1="0" x2="0" y2="0.66">
          <stop offset="0" stopColor="#0f2b3f" />
          <stop offset="0.4" stopColor="#1f6185" />
          <stop offset="0.74" stopColor="#3a9ccb" />
          <stop offset="0.92" stopColor="#9fc7d6" />
          <stop offset="1" stopColor="#f3c77a" />
        </linearGradient>
        <linearGradient id="hs-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2b86b4" />
          <stop offset="1" stopColor="#12324a" />
        </linearGradient>
        <radialGradient id="hs-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffe9a8" stopOpacity="0.9" />
          <stop offset="0.5" stopColor="#ffd56a" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ffd56a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hs-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0e2a3c" stopOpacity="0" />
          <stop offset="1" stopColor="#0e2a3c" stopOpacity="0.75" />
        </linearGradient>
      </defs>

      {/* আকাশ ও মেঘ */}
      <rect width="1600" height="640" fill="url(#hs-sky)" />
      <g fill="#ffffff" opacity="0.12">
        <ellipse cx="260" cy="150" rx="140" ry="22" />
        <ellipse cx="330" cy="135" rx="90" ry="18" />
        <ellipse cx="900" cy="110" rx="170" ry="20" />
        <ellipse cx="960" cy="96" rx="80" ry="16" />
        <ellipse cx="1400" cy="190" rx="120" ry="18" />
      </g>

      {/* সূর্য */}
      <circle cx="1210" cy="330" r="150" fill="url(#hs-glow)" />
      <circle cx="1210" cy="330" r="52" fill="#ffe08a" />

      {/* পাখি */}
      <g fill="none" stroke="#0e2a3c" strokeOpacity="0.6" strokeWidth="2.5" strokeLinecap="round">
        <path d="M420 170c8-8 16-8 22 0c6-8 14-8 22 0" />
        <path d="M470 150c7-7 14-7 19 0c5-7 12-7 19 0" />
        <path d="M520 185c6-6 12-6 16 0c4-6 10-6 16 0" />
        <path d="M1050 230c7-7 14-7 19 0c5-7 12-7 19 0" />
        <path d="M1095 215c6-6 12-6 16 0c4-6 10-6 16 0" />
      </g>

      {/* দূরের গাছের সারি */}
      <path
        fill="#15405a"
        opacity="0.55"
        d="M0 392q30-40 60 0q25-28 50 0q35-50 70 0q25-30 50 0q30-42 60 0q25-26 50 0q35-48 70 0q30-34 60 0q25-44 50 0q35-30 70 0q30-46 60 0q25-28 50 0q35-50 70 0q30-36 60 0q25-42 50 0q35-30 70 0q30-46 60 0q25-26 50 0q35-50 70 0q30-34 60 0q25-44 50 0q35-30 70 0q30-46 60 0q25-28 50 0q35-48 70 0q30-36 60 0q25-30 50 0V422H0z"
      />

      {/* কাছের গ্রাম: গাছ, তালগাছ, ঘর, মসজিদ, মন্দির */}
      <g fill="#0e2a3c" opacity="0.92">
        <rect y="400" width="1600" height="22" />
        <circle cx="80" cy="372" r="34" />
        <circle cx="118" cy="382" r="26" />
        <rect x="76" y="380" width="8" height="24" />
        <circle cx="250" cy="366" r="40" />
        <circle cx="296" cy="380" r="26" />
        <rect x="246" y="372" width="8" height="32" />
        <circle cx="1340" cy="366" r="40" />
        <circle cx="1388" cy="380" r="28" />
        <rect x="1336" y="372" width="8" height="32" />
        <circle cx="1520" cy="374" r="32" />
        <rect x="1516" y="382" width="8" height="22" />
        <path d="M470 404v-30l22-18 22 18v30z" />
        <path d="M530 404v-26l18-14 18 14v26z" />
        <path d="M1240 404v-30l22-18 22 18v30z" />
        <path d="M1290 404v-24l16-12 16 12v24z" />
        {/* মসজিদ */}
        <rect x="690" y="352" width="130" height="52" />
        <path d="M722 352a33 33 0 0 1 66 0z" />
        <rect x="754" y="306" width="2" height="16" />
        <rect x="676" y="292" width="11" height="112" />
        <circle cx="681.5" cy="289" r="7" />
        <rect x="823" y="292" width="11" height="112" />
        <circle cx="828.5" cy="289" r="7" />
        {/* মন্দির */}
        <path d="M920 404l14-80 14-40 14 40 14 80z" />
        <rect x="944" y="276" width="8" height="12" />
        <circle cx="948" cy="272" r="4" />
        <path d="M900 404v-24h70v24z" />
      </g>
      {/* তালগাছ */}
      <g fill="none" stroke="#0e2a3c" strokeWidth="6" strokeLinecap="round" opacity="0.92">
        <path d="M400 404c2-30 4-56 8-78" />
        <path d="M408 326c-22-16-44-12-56 6" />
        <path d="M408 326c-26 2-42 16-46 36" />
        <path d="M408 326c24-14 46-10 58 8" />
        <path d="M408 326c26 4 40 18 44 36" />
        <path d="M408 326c-6-22 2-40 18-50" />
        <path d="M408 326c8-22 22-34 40-38" />
        <path d="M1080 404c2-32 4-60 8-84" />
        <path d="M1088 320c-22-16-44-12-56 6" />
        <path d="M1088 320c-26 2-42 16-46 36" />
        <path d="M1088 320c24-14 46-10 58 8" />
        <path d="M1088 320c26 4 40 18 44 36" />
        <path d="M1088 320c-6-22 2-40 18-50" />
        <path d="M1088 320c8-22 22-34 40-38" />
      </g>

      {/* হাওরের পানি ও সূর্যের প্রতিফলন */}
      <rect y="420" width="1600" height="220" fill="url(#hs-water)" />
      <g fill="#ffe08a">
        <ellipse cx="1210" cy="438" rx="70" ry="5" opacity="0.5" />
        <ellipse cx="1205" cy="458" rx="95" ry="5" opacity="0.35" />
        <ellipse cx="1215" cy="482" rx="120" ry="6" opacity="0.25" />
        <ellipse cx="1200" cy="512" rx="150" ry="7" opacity="0.16" />
        <ellipse cx="1210" cy="548" rx="190" ry="8" opacity="0.1" />
      </g>
      <g fill="none" stroke="#ffffff" strokeOpacity="0.22" strokeWidth="2.5" strokeLinecap="round">
        <path d="M120 468c30-10 60-10 90 0s60 10 90 0" />
        <path d="M560 496c30-10 60-10 90 0s60 10 90 0 60-10 90 0" />
        <path d="M300 540c30-10 60-10 90 0s60 10 90 0" />
        <path d="M980 586c30-10 60-10 90 0s60 10 90 0" />
        <path d="M1380 520c30-10 60-10 90 0s60 10 90 0" />
      </g>

      {/* নৌকা */}
      <g fill="#0e2a3c">
        <path d="M1250 452q40 14 80 0l-9 11h-62z" opacity="0.85" />
        <path d="M1287 452v-30l22 30z" opacity="0.85" />
        <path d="M540 536q90 36 180 0l-22 26h-136z" />
        <rect x="628" y="462" width="4" height="74" />
        <path d="M634 464l58 52h-58z" fill="#f6f5f5" opacity="0.95" />
        <path d="M624 470l-30 44h30z" fill="#e8e2d2" opacity="0.8" />
      </g>

      {/* সামনের নলখাগড়া */}
      <g fill="none" stroke="#0e2a3c" strokeWidth="3" strokeLinecap="round" opacity="0.9">
        <path d="M40 640v-70" />
        <path d="M58 640v-92" />
        <path d="M76 640v-60" />
        <path d="M96 640v-84" />
        <path d="M116 640v-66" />
        <path d="M136 640v-96" />
        <path d="M156 640v-72" />
        <path d="M1440 640v-72" />
        <path d="M1460 640v-98" />
        <path d="M1480 640v-64" />
        <path d="M1500 640v-88" />
        <path d="M1520 640v-70" />
        <path d="M1540 640v-100" />
        <path d="M1560 640v-76" />
        <path d="M1580 640v-60" />
      </g>
      <g fill="#0e2a3c" opacity="0.9">
        <ellipse cx="58" cy="548" rx="4" ry="12" />
        <ellipse cx="136" cy="544" rx="4" ry="12" />
        <ellipse cx="1460" cy="542" rx="4" ry="12" />
        <ellipse cx="1540" cy="540" rx="4" ry="12" />
      </g>

      {/* নিচে ক্রমশ গাঢ়: লেখা পড়তে সুবিধা */}
      <rect y="400" width="1600" height="240" fill="url(#hs-fade)" />
    </svg>
  );
}
