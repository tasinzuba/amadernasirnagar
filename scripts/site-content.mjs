#!/usr/bin/env node
/**
 * সাইটের সব লেখা এক JSON ফাইলে বের করা, আর সেই ফাইলে লেখা বদলালে বদলগুলো আবার সাইটে বসানো।
 *
 *   npm run content:export          site-content/site-content.json নতুন করে লেখে (আগেরটা মুছে যায়)
 *   npm run content:apply           site-content.json-এ যা বদলেছে, শুধু সেগুলো কোড আর content/ ফাইলে বসায়
 *   npm run content:apply -- --dry  কী বদলাবে শুধু দেখায়, কিছু লেখে না
 *
 * কোডের লেখা খোঁজা হয় TypeScript পার্সার দিয়ে: JSX-এর লেখা আর বাংলা অক্ষরসহ স্ট্রিং/টেমপ্লেট।
 * content/ ফোল্ডারের JSON থেকে লেখার ঘরগুলো নেওয়া হয় (slug, স্থানাঙ্ক, ছবির পথের মতো ঘর বাদে)।
 * site-content/.base.json-এ প্রতিটা লেখার আসল মান আর অবস্থান থাকে; apply এর সঙ্গে মিলিয়ে কেবল বদলানো লেখা বসায়।
 *
 * .env.local-এ DATABASE_URL থাকলে export ও apply-এর আগে ডেটাবেস থেকে সর্বশেষ তথ্য content/ ফোল্ডারে নামানো হয়
 * (অ্যাডমিন থেকে করা বদলও তাই ধরা পড়ে), আর apply-এর পরে বদলানো তথ্য ডেটাবেসে তোলা হয় (scripts/db.mjs)।
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { loadEnv, pull, push, report as reportConflicts } from "./db.mjs";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "site-content");
const EDIT_FILE = path.join(OUT_DIR, "site-content.json");
const BASE_FILE = path.join(OUT_DIR, ".base.json");
const BN = /[ঀ-৿]/;

const CODE_DIRS = ["src/data", "src/app", "src/components", "src/actions"];
const SKIP_PATH = /(^|\/)admin(\/|$)/;

/** কোন ফাইলের লেখা JSON-এর কোন নামে দেখাবে; এই ক্রমেই সাজানো থাকে */
const GROUPS = [
  ["সাধারণ: সাইটের নাম, বিবরণ আর মেনুর নাম", ["src/data/site.ts", "src/app/layout.tsx"]],
  ["সাধারণ: ওপরের মেনু", ["src/components/site-header.tsx", "src/components/nav-menu.tsx", "src/components/nav-links.tsx", "src/components/mobile-nav.tsx"]],
  ["হোমপেজ", ["src/app/(home)/page.tsx", "src/app/(home)/layout.tsx"]],
  ["উপজেলা পরিচিতি পেজ", ["src/app/(site)/upazila/page.tsx", "src/data/upazila.ts", "src/components/timeline.tsx"]],
  ["গ্রামের তালিকা পেজ", ["src/app/(site)/villages/page.tsx", "src/components/village-search.tsx"]],
  ["প্রতিটা গ্রামের পেজ (সব গ্রামে একই কাঠামো)", ["src/app/(site)/villages/[slug]/page.tsx"]],
  ["ইউনিয়নের তালিকা পেজ", ["src/app/(site)/unions/page.tsx"]],
  ["প্রতিটা ইউনিয়নের পেজ (কাঠামো)", ["src/app/(site)/unions/[slug]/page.tsx"]],
  ["দর্শনীয় স্থানের তালিকা পেজ", ["src/app/(site)/places/page.tsx"]],
  ["প্রতিটা দর্শনীয় স্থানের পেজ (কাঠামো)", ["src/app/(site)/places/[slug]/page.tsx"]],
  ["গুণী মানুষের পেজ", ["src/app/(site)/people/page.tsx"]],
  ["শিক্ষা প্রতিষ্ঠানের তালিকা পেজ", ["src/app/(site)/schools/page.tsx", "src/components/school-directory.tsx"]],
  ["প্রতিটা শিক্ষা প্রতিষ্ঠানের পেজ (কাঠামো)", ["src/app/(site)/schools/[slug]/page.tsx"]],
  ["খবরের তালিকা পেজ", ["src/app/(site)/news/page.tsx"]],
  ["প্রতিটা খবরের পেজ (কাঠামো)", ["src/app/(site)/news/[slug]/page.tsx"]],
  ["উৎসব ও মেলার পেজ", ["src/app/(site)/events/page.tsx"]],
  ["যাতায়াত গাইড পেজ", ["src/app/(site)/transport/page.tsx", "src/data/transport.ts"]],
  ["জরুরি নম্বরের পেজ", ["src/app/(site)/emergency/page.tsx"]],
  ["মানচিত্রের পেজ", ["src/app/(site)/map/page.tsx", "src/components/map/map-view.tsx", "src/components/map/leaflet-map.tsx"]],
  ["তথ্য দিন পেজ", ["src/app/(site)/contribute/page.tsx"]],
  ["তথ্য দেওয়ার ফর্ম (হোমপেজ আর তথ্য দিন পেজে একই)", ["src/components/contribute-form.tsx", "src/actions/contribute.ts"]],
  ["আমাদের সম্পর্কে পেজ", ["src/app/(site)/about/page.tsx"]],
  ["আমাদের টিম পেজ", ["src/app/(site)/team/page.tsx", "src/data/team.ts"]],
  ["ফুটার আর খোঁজার বাক্স", ["src/components/site-footer.tsx", "src/components/search-form.tsx"]],
  ["পেজ না পেলে (৪০৪)", ["src/app/not-found.tsx", "src/app/(site)/not-found.tsx", "src/components/not-found-body.tsx"]],
];
const REST_GROUP = "সাধারণ: কার্ড, ব্যাজ আর অন্যান্য ছোট অংশ";

/** content/ ফোল্ডারের তথ্য */
const DATA_GROUPS = [
  ["তথ্য: ইউনিয়ন", "content/unions.json"],
  ["তথ্য: দর্শনীয় স্থান", "content/places.json"],
  ["তথ্য: গুণী মানুষ", "content/people.json"],
  ["তথ্য: খবর", "content/news.json"],
  ["তথ্য: উৎসব ও মেলা", "content/events.json"],
  ["তথ্য: জরুরি নম্বর", "content/emergency.json"],
  ["তথ্য: শিক্ষা প্রতিষ্ঠান", "content/schools.json"],
];
const VILLAGES_WRITTEN = "তথ্য: গ্রাম (যেগুলোর কথা লেখা হয়েছে)";
const VILLAGES_STUB = "তথ্য: গ্রামের নাম (যেগুলোর কথা এখনো লেখা হয়নি)";
/** content/ JSON-এর যে ঘরগুলো লেখা নয় (চিহ্ন, তারিখ, স্থানাঙ্ক, ছবির পথ) */
const DATA_SKIP = new Set(["slug", "union", "village", "status", "type", "cover", "images", "lat", "lng", "date", "updatedAt", "featured", "attractions", "people", "url", "href", "src", "eiin", "phone", "email", "website", "sources"]);

/** কোডে যে প্রপার্টি বা অ্যাট্রিবিউটের মান লেখা নয় (চিহ্ন, ক্লাস, লিংক) */
const DENY_PROPS = new Set(["slug", "href", "id", "type", "tone", "status", "union", "village", "className", "key", "src", "url", "icon", "lat", "lng", "date", "theme", "cover", "image", "path", "pillClass", "tint"]);
const DENY_ATTRS = new Set(["className", "key", "href", "id", "htmlFor", "name", "type", "src", "rel", "target", "role", "dateTime", "sizes", "tone", "theme", "method", "action", "autoComplete", "inputMode", "pattern"]);
const LOGIC_CALL = /^(console\.\w+|Error|.*\.(includes|startsWith|endsWith|split|replace|replaceAll|indexOf|lastIndexOf|test|match|localeCompare))$/;

const sha = (s) => crypto.createHash("sha1").update(s).digest("hex");
const rel = (abs) => path.relative(ROOT, abs).split(path.sep).join("/");
const pad = (n) => String(n).padStart(3, "0");

/* ------------------------------------------------------------------ */
/* কোড থেকে লেখা বের করা                                               */
/* ------------------------------------------------------------------ */

/** Babel-এর নিয়মে JSX লেখার ফাঁকা জায়গা গোছানো (ব্রাউজারে যেমন দেখায়) */
function cleanJsxText(raw) {
  const lines = raw.split(/\r\n|\n|\r/);
  let lastNonEmpty = 0;
  lines.forEach((l, i) => {
    if (/[^ \t]/.test(l)) lastNonEmpty = i;
  });
  let out = "";
  lines.forEach((line, i) => {
    let t = line.replace(/\t/g, " ");
    if (i !== 0) t = t.replace(/^[ ]+/, "");
    if (i !== lines.length - 1) t = t.replace(/[ ]+$/, "");
    if (t) {
      if (i !== lastNonEmpty) t += " ";
      out += t;
    }
  });
  return out;
}

function hasBengaliOrJsx(node) {
  let found = false;
  const walk = (n) => {
    if (found) return;
    if (ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n) || ts.isJsxFragment(n)) found = true;
    else if ((ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) && BN.test(n.text)) found = true;
    else if (ts.isTemplateHead(n) || ts.isTemplateMiddle(n) || ts.isTemplateTail(n)) {
      if (BN.test(n.text)) found = true;
    } else ts.forEachChild(n, walk);
  };
  walk(node);
  return found;
}

function propName(name) {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) return name.text;
  return name.getText();
}

function jsxTag(el) {
  if (ts.isJsxElement(el)) return el.openingElement.tagName.getText();
  if (ts.isJsxSelfClosingElement(el)) return el.tagName.getText();
  return "fragment";
}

function excludedLiteral(node) {
  const p = node.parent;
  if (!p) return true;
  if (ts.isPropertyAssignment(p) && p.name === node) return true;
  if (ts.isPropertyAssignment(p) && DENY_PROPS.has(propName(p.name))) return true;
  if (ts.isLiteralTypeNode(p)) return true;
  if (ts.isImportDeclaration(p) || ts.isExportDeclaration(p)) return true;
  if (ts.isCaseClause(p)) return true;
  if (ts.isElementAccessExpression(p) && p.argumentExpression === node) return true;
  if (ts.isBinaryExpression(p)) {
    const k = p.operatorToken.kind;
    const S = ts.SyntaxKind;
    if (k === S.EqualsEqualsEqualsToken || k === S.ExclamationEqualsEqualsToken || k === S.EqualsEqualsToken || k === S.ExclamationEqualsToken) return true;
  }
  if ((ts.isCallExpression(p) || ts.isNewExpression(p)) && LOGIC_CALL.test(p.expression.getText())) return true;
  // JSX অ্যাট্রিবিউট
  for (let a = p; a && !ts.isJsxElement(a) && !ts.isJsxSelfClosingElement(a); a = a.parent) {
    if (ts.isJsxAttribute(a)) {
      const attr = a.name.getText();
      const tag = a.parent.parent.tagName.getText();
      if (DENY_ATTRS.has(attr)) return true;
      if (attr === "value" && /^[a-z]/.test(tag)) return true;
      break;
    }
    if (ts.isStatement(a)) break;
  }
  return false;
}

/** লেখাটা কোথায় আছে তার ছোট বর্ণনা (যেমন h1, PageHeader.title, features[2].title) */
function labelFor(node) {
  for (let a = node.parent; a && !ts.isStatement(a); a = a.parent) {
    if (ts.isJsxAttribute(a)) return `${a.parent.parent.tagName.getText()}.${a.name.getText()}`;
    if (ts.isJsxElement(a) || ts.isJsxSelfClosingElement(a) || ts.isJsxFragment(a)) break;
  }
  const parts = [];
  let cur = node;
  while (cur.parent) {
    const par = cur.parent;
    if (ts.isPropertyAssignment(par)) parts.unshift(propName(par.name));
    else if (ts.isArrayLiteralExpression(par)) parts.unshift(`[${par.elements.indexOf(cur) + 1}]`);
    else if (ts.isVariableDeclaration(par)) {
      parts.unshift(par.name.getText());
      break;
    } else if (ts.isReturnStatement(par)) {
      parts.unshift("return");
      break;
    } else if (ts.isJsxExpression(par)) {
      parts.unshift(jsxTag(par.parent));
      break;
    } else if (ts.isCallExpression(par)) {
      parts.unshift(`${par.expression.getText().slice(0, 30)}()`);
      break;
    } else if (
      !(
        ts.isObjectLiteralExpression(par) ||
        ts.isParenthesizedExpression(par) ||
        ts.isAsExpression(par) ||
        ts.isConditionalExpression(par) ||
        ts.isBinaryExpression(par) ||
        ts.isTemplateSpan(par) ||
        ts.isTemplateExpression(par) ||
        (ts.isSatisfiesExpression && ts.isSatisfiesExpression(par))
      )
    )
      break;
    cur = par;
  }
  return parts.join(".").replace(/\.\[/g, "[") || "লেখা";
}

/** টেমপ্লেটের লেখা: স্থির অংশ আর {এক্সপ্রেশন} মিলিয়ে */
function templateText(node) {
  let text = node.head.text;
  const exprs = [];
  for (const span of node.templateSpans) {
    const code = span.expression.getText();
    exprs.push(code);
    text += `{${code}}` + span.literal.text;
  }
  return { text, exprs, plain: node.head.text + node.templateSpans.map((s) => s.literal.text).join("") };
}

function extractEntries(file, src) {
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const entries = [];
  const handled = new Set();

  const collectRuns = (el) => {
    let run = [];
    const flush = () => {
      if (run.length) {
        let text = "";
        let plain = "";
        const exprs = [];
        for (const c of run) {
          if (ts.isJsxText(c)) {
            const t = cleanJsxText(src.slice(c.pos, c.end));
            text += t;
            plain += t;
          } else if (c.expression && ts.isStringLiteral(c.expression) && /^\s*$/.test(c.expression.text)) {
            text += c.expression.text;
            plain += c.expression.text;
          } else {
            const code = c.expression.getText();
            exprs.push(code);
            text += `{${code}}`;
          }
        }
        if (BN.test(plain)) {
          entries.push({
            kind: "jsx",
            label: jsxTag(el),
            start: run[0].pos,
            end: run[run.length - 1].end,
            text: text.trim(),
            lead: /^\s/.test(text),
            trail: /\s$/.test(text),
            exprs,
          });
          run.forEach((c) => handled.add(c));
        }
      }
      run = [];
    };
    for (const c of el.children) {
      if (ts.isJsxText(c)) run.push(c);
      else if (ts.isJsxExpression(c) && c.expression && !hasBengaliOrJsx(c.expression)) run.push(c);
      else flush();
    }
    flush();
  };

  const visit = (node) => {
    if (ts.isJsxElement(node) || ts.isJsxFragment(node)) collectRuns(node);
    if (handled.has(node)) return;

    if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) && BN.test(node.text) && !excludedLiteral(node)) {
      const inAttr = ts.isJsxAttribute(node.parent);
      entries.push({
        kind: ts.isStringLiteral(node) ? (inAttr ? "attr" : "string") : "template",
        label: labelFor(node),
        start: node.getStart(sf),
        end: node.end,
        text: node.text,
      });
      return;
    }
    if (ts.isTemplateExpression(node) && !excludedLiteral(node)) {
      const { text, exprs, plain } = templateText(node);
      const nested = node.templateSpans.some((s) => hasBengaliOrJsx(s.expression));
      if (BN.test(plain) && !nested) {
        entries.push({ kind: "template", label: labelFor(node), start: node.getStart(sf), end: node.end, text, exprs });
        return;
      }
      if (nested) {
        // ভেতরে আলাদা বাংলা লেখা আছে: স্থির অংশগুলো আলাদা করে নেওয়া
        for (const part of [node.head, ...node.templateSpans.map((s) => s.literal)]) {
          if (!BN.test(part.text)) continue;
          const startOff = part.getStart(sf) + 1;
          const endOff = ts.isTemplateTail(part) ? part.end - 1 : part.end - 2;
          entries.push({ kind: "templatePart", label: labelFor(node), start: startOff, end: endOff, text: part.text });
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  entries.sort((a, b) => a.start - b.start);
  // একই লেখা একই ফাইলে কতবার আছে, তার ক্রম (ফাইল বদলে গেলে খুঁজে পেতে)
  const seen = new Map();
  for (const e of entries) {
    const k = `${e.kind}\u0000${e.text}`;
    e.occurrence = seen.get(k) ?? 0;
    seen.set(k, e.occurrence + 1);
  }
  return entries;
}

function listCodeFiles() {
  const out = [];
  const walk = (dir) => {
    for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, d.name);
      const r = rel(abs);
      if (SKIP_PATH.test(r)) continue;
      if (d.isDirectory()) walk(abs);
      else if (/\.(tsx?|mts)$/.test(d.name) && !d.name.endsWith(".d.ts")) out.push(r);
    }
  };
  for (const d of CODE_DIRS) if (fs.existsSync(path.join(ROOT, d))) walk(path.join(ROOT, d));
  return out.sort();
}

/* ------------------------------------------------------------------ */
/* content/ JSON                                                        */
/* ------------------------------------------------------------------ */

function prune(v) {
  if (typeof v === "string") return v;
  if (Array.isArray(v)) {
    const a = v.map(prune);
    return a.some((x) => x !== undefined) ? a.map((x) => (x === undefined ? null : x)) : undefined;
  }
  if (v && typeof v === "object") {
    const o = {};
    for (const [k, x] of Object.entries(v)) {
      if (DATA_SKIP.has(k)) continue;
      const p = prune(x);
      if (p !== undefined) o[k] = p;
    }
    return Object.keys(o).length ? o : undefined;
  }
  return undefined;
}

function readJson(r) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, r), "utf8"));
}

function writeJson(r, data) {
  fs.writeFileSync(path.join(ROOT, r), JSON.stringify(data, null, 2) + "\n");
}

function exportData() {
  const groups = {};
  for (const [name, file] of DATA_GROUPS) {
    const data = readJson(file);
    groups[name] = Array.isArray(data) ? Object.fromEntries(data.map((item) => [item.slug, prune(item) ?? {}])) : prune(data);
  }
  const written = {};
  const stub = {};
  for (const f of fs.readdirSync(path.join(ROOT, "content/villages")).sort()) {
    if (!f.endsWith(".json")) continue;
    const v = readJson(`content/villages/${f}`);
    (v.status === "stub" ? stub : written)[v.slug] = prune(v) ?? {};
  }
  groups[VILLAGES_WRITTEN] = written;
  groups[VILLAGES_STUB] = stub;
  return groups;
}

/* ------------------------------------------------------------------ */
/* export                                                               */
/* ------------------------------------------------------------------ */

const INSTRUCTIONS = [
  "এই ফাইলে সাইটের সব পেজের লেখা আছে, পেজ ধরে ধরে। শুধু ডান পাশের লেখা (মান) বদলান, বাঁ পাশের নাম (কী) বদলাবেন না।",
  "বাঁ পাশের নামে নম্বর আর লেখাটা কোথায় বসে তার ইঙ্গিত থাকে, যেমন h1 মানে পেজের বড় শিরোনাম, p মানে অনুচ্ছেদ, placeholder মানে ঘরের ভেতরের হালকা লেখা।",
  "{ } বন্ধনীর ভেতরের অংশ (যেমন {toBn(stats.villages)}) বদলাবেন না, মুছবেনও না। ওখানে সাইট নিজে সংখ্যা বা নাম বসায়। চাইলে বন্ধনীর আশপাশের লেখা বদলাতে পারেন।",
  "কোনো লাইন মুছবেন না, নতুন লাইন যোগ করবেন না। নতুন সেকশন বা নতুন লেখা লাগলে আলাদা করে বলুন।",
  "\"তথ্য:\" দিয়ে শুরু অংশগুলো content/ ফোল্ডারের তথ্য (গ্রাম, ইউনিয়ন, দর্শনীয় স্থান ইত্যাদি)। এগুলো অ্যাডমিন প্যানেল থেকেও বদলানো যায়।",
  "বদলানো ফাইলটা আমাকে দিলে বা এখানেই রেখে বললে আমি সাইটে বসিয়ে দেব (npm run content:apply)। পাশের .base.json ফাইলটা বদলাবেন না, ওটা দিয়েই বোঝা যায় কী বদলেছে।",
];

function doExport() {
  const files = listCodeFiles();
  const groupOf = new Map();
  for (const [name, list] of GROUPS) for (const f of list) groupOf.set(f, name);

  const edit = { _নির্দেশনা: INSTRUCTIONS };
  const base = { version: 1, exportedAt: new Date().toISOString(), files: {}, code: {}, data: {} };
  const byGroup = new Map([...GROUPS.map(([n]) => [n, []]), [REST_GROUP, []]]);

  for (const file of files) {
    const src = fs.readFileSync(path.join(ROOT, file), "utf8");
    const entries = extractEntries(file, src);
    if (!entries.length) continue;
    base.files[file] = sha(src);
    byGroup.get(groupOf.get(file) ?? REST_GROUP).push({ file, entries });
  }
  // GROUPS-এর ফাইলগুলো তালিকার ক্রমে
  const order = new Map(GROUPS.flatMap(([, list]) => list).map((f, i) => [f, i]));
  for (const [name, list] of byGroup) {
    if (!list.length) continue;
    list.sort((a, b) => (order.get(a.file) ?? 1e9) - (order.get(b.file) ?? 1e9) || a.file.localeCompare(b.file));
    const g = {};
    const gb = {};
    let n = 0;
    for (const { file, entries } of list) {
      for (const e of entries) {
        const key = `${pad(++n)} · ${e.label}`;
        g[key] = e.text;
        gb[key] = { file, ...e };
      }
    }
    edit[name] = g;
    base.code[name] = gb;
  }

  const data = exportData();
  for (const [name, value] of Object.entries(data)) {
    edit[name] = value;
    base.data[name] = value;
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(EDIT_FILE, JSON.stringify(edit, null, 2) + "\n");
  fs.writeFileSync(BASE_FILE, JSON.stringify(base, null, 2) + "\n");
  const codeCount = Object.values(base.code).reduce((s, g) => s + Object.keys(g).length, 0);
  console.log(`লেখা বের হলো: কোড থেকে ${codeCount}টি, তথ্যের ${Object.keys(data).length}টি অংশ → ${rel(EDIT_FILE)}`);
}

/* ------------------------------------------------------------------ */
/* apply                                                                */
/* ------------------------------------------------------------------ */

/** "{...}" অংশগুলো আলাদা করা (ভেতরের বন্ধনী মিলিয়ে) */
function splitPlaceholders(text) {
  const parts = [];
  let buf = "";
  let depth = 0;
  let expr = "";
  for (const ch of text) {
    if (depth === 0) {
      if (ch === "{") {
        parts.push({ t: "text", v: buf });
        buf = "";
        depth = 1;
        expr = "";
      } else if (ch === "}") throw new Error("বাড়তি } চিহ্ন আছে");
      else buf += ch;
    } else {
      if (ch === "{") depth++;
      if (ch === "}") depth--;
      if (depth === 0) parts.push({ t: "expr", v: expr });
      else expr += ch;
    }
  }
  if (depth !== 0) throw new Error("{ বন্ধনী বন্ধ হয়নি");
  parts.push({ t: "text", v: buf });
  return parts;
}

const norm = (s) => s.replace(/\s+/g, " ").trim();

function checkExprs(parts, exprs) {
  const got = parts.filter((p) => p.t === "expr").map((p) => norm(p.v));
  const want = exprs.map(norm);
  if (got.length !== want.length || got.some((g, i) => g !== want[i])) {
    throw new Error(`{ } অংশ বদলে গেছে বা মুছে গেছে (থাকার কথা: ${want.map((w) => `{${w}}`).join(" ") || "কিছুই না"})`);
  }
}

function buildReplacement(entry, newText) {
  switch (entry.kind) {
    case "string":
      return JSON.stringify(newText);
    case "attr":
      return /["\\\n]/.test(newText) ? `{${JSON.stringify(newText)}}` : `"${newText}"`;
    case "templatePart":
      return newText.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
    case "template": {
      const parts = splitPlaceholders(newText);
      checkExprs(parts, entry.exprs ?? []);
      let i = 0;
      const body = parts
        .map((p) => (p.t === "text" ? p.v.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${") : `\${${entry.exprs[i++]}}`))
        .join("");
      return "`" + body + "`";
    }
    case "jsx": {
      const parts = splitPlaceholders(newText.trim());
      checkExprs(parts, entry.exprs ?? []);
      let i = 0;
      const body = parts
        .map((p) => {
          if (p.t === "expr") return `{${entry.exprs[i++]}}`;
          if (/[<>]/.test(p.v)) throw new Error("লেখায় < বা > চিহ্ন রাখা যাবে না");
          return p.v.replace(/\s*\n\s*/g, " ");
        })
        .join("");
      return (entry.lead ? '{" "}' : "") + body + (entry.trail ? '{" "}' : "");
    }
    default:
      throw new Error(`অজানা ধরন ${entry.kind}`);
  }
}

/** কোডের কোন ফাইলে কী বদলাবে তা হিসাব করা (এখনো কিছু লেখা হয় না) */
function planCode(edit, base, report) {
  const byFile = new Map();
  for (const [group, entries] of Object.entries(base.code)) {
    const g = edit[group];
    if (!g || typeof g !== "object") {
      report.warnings.push(`${group}: অংশটা ফাইলে নেই, এর লেখা আগের মতোই থাকল`);
      continue;
    }
    for (const key of Object.keys(g)) {
      if (!(key in entries)) report.warnings.push(`${group} → ${key}: নতুন লাইন যোগ করা যায় না, বাদ দিলাম`);
    }
    for (const [key, entry] of Object.entries(entries)) {
      const now = g[key];
      if (now === undefined) {
        report.warnings.push(`${group} → ${key}: লাইনটা নেই (মুছে গেছে?), আগের লেখাই থাকল`);
        continue;
      }
      if (typeof now !== "string") {
        report.errors.push(`${group} → ${key}: লেখার জায়গায় অন্য কিছু আছে`);
        continue;
      }
      if (now === entry.text) continue;
      if (!byFile.has(entry.file)) byFile.set(entry.file, []);
      byFile.get(entry.file).push({ group, key, entry, now });
    }
  }
  const writes = new Map();
  for (const [file, changes] of byFile) {
    const abs = path.join(ROOT, file);
    if (!fs.existsSync(abs)) {
      report.errors.push(`${file}: ফাইলটা আর নেই`);
      continue;
    }
    let src = fs.readFileSync(abs, "utf8");
    const same = sha(src) === base.files[file];
    const current = same ? null : extractEntries(file, src);
    const reps = [];
    for (const c of changes) {
      let target = c.entry;
      if (!same) {
        const found = current.find((e) => e.kind === c.entry.kind && e.text === c.entry.text && e.occurrence === c.entry.occurrence);
        if (!found) {
          report.errors.push(`${c.group} → ${c.key}: ${file} ফাইলে আগের লেখাটা আর পাওয়া গেল না`);
          continue;
        }
        target = { ...c.entry, ...found };
      }
      try {
        reps.push({ start: target.start, end: target.end, text: buildReplacement(target, c.now), c });
      } catch (err) {
        report.errors.push(`${c.group} → ${c.key}: ${err.message}`);
      }
    }
    reps.sort((a, b) => b.start - a.start);
    for (const r of reps) {
      src = src.slice(0, r.start) + r.text + src.slice(r.end);
      report.changes.push(`${file}: ${r.c.key}\n    আগে: ${r.c.entry.text}\n    এখন: ${r.c.now}`);
    }
    if (reps.length) writes.set(file, src);
  }
  return writes;
}

/** দুই কাঠামো মিলিয়ে বদলানো লেখার পথ বের করা */
function diffData(before, after, pathParts, out, errors, where) {
  const at = `${where} → ${pathParts.join(".")}`;
  if (typeof before === "string" || before === null) {
    if (after !== before) {
      if (typeof after !== "string" && after !== null) errors.push(`${at}: লেখার জায়গায় অন্য কিছু আছে`);
      else out.push({ path: pathParts, before, after });
    }
    return;
  }
  if (Array.isArray(before)) {
    if (!Array.isArray(after)) {
      errors.push(`${at}: তালিকা থাকার কথা`);
      return;
    }
    const allStrings = before.every((x) => typeof x === "string") && after.every((x) => typeof x === "string");
    if (before.length !== after.length) {
      if (allStrings) out.push({ path: pathParts, before, after });
      else errors.push(`${at}: তালিকার ঘরের সংখ্যা বদলেছে`);
      return;
    }
    before.forEach((b, i) => diffData(b, after[i], [...pathParts, i], out, errors, where));
    return;
  }
  if (before && typeof before === "object") {
    if (!after || typeof after !== "object" || Array.isArray(after)) {
      errors.push(`${at}: কাঠামো বদলে গেছে`);
      return;
    }
    for (const k of Object.keys(before)) {
      if (!(k in after)) errors.push(`${at}.${k}: ঘরটা মুছে গেছে`);
      else diffData(before[k], after[k], [...pathParts, k], out, errors, where);
    }
  }
}

function getPath(obj, p) {
  return p.reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

function setPath(obj, p, value) {
  let cur = obj;
  for (let i = 0; i < p.length - 1; i++) cur = cur[p[i]];
  cur[p[p.length - 1]] = value;
}

/** content/ ফাইলে কী বদলাবে তা হিসাব করা (এখনো কিছু লেখা হয় না) */
function planData(edit, base, report) {
  const writes = new Map();
  const load = (f) => {
    if (!writes.has(f)) writes.set(f, readJson(f));
    return writes.get(f);
  };
  const changed = new Set();
  const targets = [...DATA_GROUPS, [VILLAGES_WRITTEN, null], [VILLAGES_STUB, null]];
  for (const [group, file] of targets) {
    const before = base.data[group];
    const after = edit[group];
    if (!before) continue;
    if (!after) {
      report.warnings.push(`${group}: অংশটা ফাইলে নেই, এর তথ্য আগের মতোই থাকল`);
      continue;
    }
    const diffs = [];
    diffData(before, after, [], diffs, report.errors, group);
    for (const d of diffs) {
      let f = file;
      let target;
      let p = d.path;
      if (file === null) {
        f = `content/villages/${p[0]}.json`;
        target = load(f);
        p = p.slice(1);
      } else {
        const data = load(file);
        if (Array.isArray(data)) {
          target = data.find((x) => x.slug === p[0]);
          if (!target) {
            report.errors.push(`${group} → ${p[0]}: এই slug ফাইলে নেই`);
            continue;
          }
          p = p.slice(1);
        } else target = data;
      }
      if (JSON.stringify(getPath(target, p)) !== JSON.stringify(d.before)) {
        report.errors.push(`${group} → ${d.path.join(".")}: এর মধ্যে অন্য কোথাও (অ্যাডমিনে?) বদলেছে`);
        continue;
      }
      setPath(target, p, d.after);
      changed.add(f);
      report.changes.push(`${f}: ${d.path.join(".")}\n    আগে: ${JSON.stringify(d.before)}\n    এখন: ${JSON.stringify(d.after)}`);
    }
  }
  for (const f of [...writes.keys()]) if (!changed.has(f)) writes.delete(f);
  return writes;
}

function doApply(dry) {
  if (!fs.existsSync(EDIT_FILE) || !fs.existsSync(BASE_FILE)) {
    console.error("site-content.json বা .base.json পাওয়া গেল না। আগে npm run content:export চালান।");
    process.exit(1);
  }
  const edit = JSON.parse(fs.readFileSync(EDIT_FILE, "utf8"));
  const base = JSON.parse(fs.readFileSync(BASE_FILE, "utf8"));
  const report = { changes: [], errors: [], warnings: [] };
  for (const key of Object.keys(edit)) {
    if (!key.startsWith("_") && !(key in base.code) && !(key in base.data)) report.warnings.push(`${key}: নতুন অংশ যোগ করা যায় না, বাদ দিলাম`);
  }
  const codeWrites = planCode(edit, base, report);
  const dataWrites = planData(edit, base, report);

  console.log(`${dry ? "(শুধু দেখানো হচ্ছে, কিছু লেখা হয়নি) " : ""}বদল: ${report.changes.length}টি`);
  for (const c of report.changes) console.log(`- ${c}`);
  if (report.warnings.length) {
    console.log(`\nখেয়াল করুন: ${report.warnings.length}টি`);
    for (const w of report.warnings) console.log(`~ ${w}`);
  }
  if (report.errors.length) {
    console.log(`\nসমস্যা: ${report.errors.length}টি`);
    for (const e of report.errors) console.log(`! ${e}`);
    console.log("\nসমস্যা থাকায় কিছুই বসানো হলো না। ওপরের লাইনগুলো ঠিক করে আবার চালান।");
    process.exitCode = 1;
    return [];
  }
  if (dry || !report.changes.length) return [];
  for (const [file, src] of codeWrites) fs.writeFileSync(path.join(ROOT, file), src);
  for (const [file, data] of dataWrites) writeJson(file, data);
  console.log("\nসব বদল বসানো হলো।");
  doExport(); // নতুন অবস্থা থেকে আবার বের করা, যাতে পরের বদলও মেলানো যায়
  return [...dataWrites.keys()];
}

/* ------------------------------------------------------------------ */
/* ডেটাবেস                                                              */
/* ------------------------------------------------------------------ */

/** content/villages/x.json → village:x, content/unions.json → unions */
function keyForFile(f) {
  const name = path.basename(f, ".json");
  return f.replaceAll("\\", "/").includes("/villages/") ? `village:${name}` : name;
}

/** ডেটাবেস থাকলে আগে সেখান থেকে সর্বশেষ তথ্য নামানো; ফোল্ডারে না-তোলা বদল থাকলে থেমে যাওয়া */
async function syncFromDb() {
  if (!loadEnv()) return false;
  const r = await pull();
  if (r.conflicts.length) {
    reportConflicts(r.conflicts);
    console.log("content/ ফোল্ডারের এই ফাইলগুলোতে ডেটাবেসে না-তোলা বদল আছে, তাই থামলাম। আগে npm run db:push বা db:pull দিয়ে মিলিয়ে নিন।");
    process.exit(1);
  }
  const n = r.written.length + r.removed.length;
  console.log(`ডেটাবেস থেকে সর্বশেষ তথ্য নেওয়া হলো${n ? ` (${n}টি ফাইল বদলাল)` : ""}।`);
  return true;
}

const cmd = process.argv[2];
if (cmd === "export") {
  await syncFromDb();
  doExport();
} else if (cmd === "apply") {
  const db = await syncFromDb();
  const changed = doApply(process.argv.includes("--dry"));
  if (db && changed.length) {
    const r = await push({ keys: changed.map(keyForFile) });
    console.log(`ডেটাবেসে তোলা হলো: ${r.written.length}টি তথ্য-ফাইল${r.written.length ? ` (${r.written.join(", ")})` : ""}।`);
    reportConflicts(r.conflicts);
  }
} else {
  console.log("ব্যবহার: node scripts/site-content.mjs export | apply [--dry]");
  process.exit(1);
}
