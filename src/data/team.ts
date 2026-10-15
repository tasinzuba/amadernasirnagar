/** যাঁদের উদ্যোগে সাইটটি চলছে: "আমাদের টিম" পেজ (/team) আর ফুটারে দেখায় */
export interface TeamMember {
  name: string;
  nameEn?: string;
  role: string;
  bio?: string;
  facebook?: string;
  /** public/images/team/ ফোল্ডারের ছবি; যেমন আছে তেমন পোর্ট্রেট আকারে দেখায় */
  photo?: string;
}

export const team: TeamMember[] = [
  {
    name: "Md Jubayer Ahamed",
    role: "সাইট তৈরি ও পরিচালনা",
    facebook: "https://www.facebook.com/jubayerahamed82",
  },
];
