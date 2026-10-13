/**
 * ভেতরের পেজের শিরোনাম-ব্যান্ডের রং। নকশা সব পেজে এক (গ্রিড, বড় রিং, উজ্জ্বল উপশিরোনাম),
 * শুধু রং আলাদা: bg/bg2 = গাঢ় পটভূমির গ্রেডিয়েন্ট, accent = উজ্জ্বল রং, ring = রিংয়ের ফিকে রং।
 */
export type PageTheme =
  | "villages"
  | "unions"
  | "places"
  | "people"
  | "schools"
  | "news"
  | "events"
  | "transport"
  | "emergency"
  | "map"
  | "upazila"
  | "contribute"
  | "about"
  | "default";

export interface ThemeColors {
  bg: string;
  bg2: string;
  accent: string;
  ring: string;
}

export const pageThemes: Record<PageTheme, ThemeColors> = {
  villages: { bg: "#0a2540", bg2: "#0f3a66", accent: "#5cc8ff", ring: "rgba(92,200,255,0.13)" },
  unions: { bg: "#1c1046", bg2: "#2e1a6b", accent: "#b49cff", ring: "rgba(180,156,255,0.13)" },
  places: { bg: "#04302f", bg2: "#0a4a46", accent: "#3ee6c4", ring: "rgba(62,230,196,0.12)" },
  people: { bg: "#3a0c1d", bg2: "#5a1330", accent: "#ff8fab", ring: "rgba(255,143,171,0.12)" },
  schools: { bg: "#1f2a06", bg2: "#34450c", accent: "#d4f25c", ring: "rgba(212,242,92,0.12)" },
  news: { bg: "#171a2e", bg2: "#272b48", accent: "#ffcf5c", ring: "rgba(255,207,92,0.11)" },
  events: { bg: "#390c35", bg2: "#5a1552", accent: "#ff9de6", ring: "rgba(255,157,230,0.12)" },
  transport: { bg: "#052e1b", bg2: "#0a4a2c", accent: "#5af08a", ring: "rgba(90,240,138,0.12)" },
  emergency: { bg: "#3d0b0b", bg2: "#5c1212", accent: "#ff7a7a", ring: "rgba(255,122,122,0.12)" },
  map: { bg: "#10153d", bg2: "#1b2366", accent: "#8fa2ff", ring: "rgba(143,162,255,0.13)" },
  upazila: { bg: "#2c1a05", bg2: "#47290a", accent: "#ffc35c", ring: "rgba(255,195,92,0.12)" },
  contribute: { bg: "#3a1705", bg2: "#5f2709", accent: "#ffa25c", ring: "rgba(255,162,92,0.13)" },
  about: { bg: "#062b33", bg2: "#0a4450", accent: "#4fe0ff", ring: "rgba(79,224,255,0.12)" },
  default: { bg: "#14142b", bg2: "#24234a", accent: "#ff8b9a", ring: "rgba(255,139,154,0.12)" },
};
