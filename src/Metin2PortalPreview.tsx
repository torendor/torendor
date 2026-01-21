"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Swords,
  Shield,
  ScrollText,
  CalendarDays,
  Skull,
  Store,
  Sparkles,
  Gem,
  Wand2,
  Map,
  DoorOpen,
  Target,
  Coins,
  Crosshair,
  HeartPulse,
  Flame,
  Zap,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/**
 * ✅ Bu sürüm:
 * - Koyu tema (beyaz yok)
 * - Mobil uyum + kategori şeridi mobilde yatay kayar
 * - Önizle → direkt REHBER (özet/checklist/kaynak yok)
 * - Her karakter için: Farm / Boss / PvP / Dengeli sekmeleri
 * - Görseller: otomatik MediaWiki dosya yolu (Special:FilePath)
 * - Reklam alanları için bileşen şablonları
 *
 * ❗ Not (önemli):
 * - Bir sitenin tüm içeriğini otomatik çekip birebir kopyalamak telif nedeniyle doğru değil.
 * - Bu uygulama: "en iyi rehber" formatını (UI + veri modeli) kurar.
 * - İçeriği tamamen doldurmak için veri ekleyerek ilerleriz (item listeleri, zırh/silah isimleri, harita konumları).
 */

// ---- NAV ----
const NAV = [
  { key: "anasayfa", label: "Anasayfa", icon: Sparkles, tone: "from-violet-500/25 to-cyan-500/10" },
  { key: "karakterler", label: "Karakterler", icon: Swords, tone: "from-amber-500/25 to-rose-500/10" },
  { key: "bosslar", label: "Bosslar", icon: Skull, tone: "from-red-500/25 to-orange-500/10" },
  { key: "taslar", label: "Taşlar", icon: Gem, tone: "from-emerald-500/25 to-sky-500/10" },
  { key: "efsunlar", label: "Efsunlar", icon: Wand2, tone: "from-fuchsia-500/25 to-indigo-500/10" },
  { key: "ekipman", label: "Ekipman", icon: Shield, tone: "from-cyan-500/25 to-emerald-500/10" },
  { key: "sistemler", label: "Sistemler", icon: ScrollText, tone: "from-sky-500/25 to-indigo-500/10" },
  { key: "gorevler", label: "Görevler", icon: ScrollText, tone: "from-lime-500/25 to-amber-500/10" },
  { key: "etkinlikler", label: "Etkinlikler", icon: CalendarDays, tone: "from-rose-500/25 to-violet-500/10" },
  { key: "haritalar", label: "Haritalar", icon: Map, tone: "from-teal-500/25 to-emerald-500/10" },
  { key: "zindanlar", label: "Zindanlar", icon: DoorOpen, tone: "from-indigo-500/25 to-cyan-500/10" },
  { key: "pazar", label: "Pazar", icon: Store, tone: "from-teal-500/25 to-emerald-500/10" },
] as const;

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// ---- MediaWiki image helper ----
// TR Wiki dosya görsellerini direkt göstermek için:
// wikiImg("Savaşçı.png") gibi.
function wikiImg(fileName: string) {
  return `https://tr-wiki.metin2.gameforge.com/index.php/Special:FilePath/${encodeURIComponent(fileName)}`;
}

function maybeWikiImg(fileName?: string | null) {
  if (!fileName) return undefined;
  const trimmed = fileName.trim();
  if (!trimmed) return undefined;
  return wikiImg(trimmed);
}

// Yer tutucu görsel
function makeSvgDataUri(title: string, accent = "#8b5cf6") {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${accent}" stop-opacity="0.75"/>
      <stop offset="1" stop-color="#22d3ee" stop-opacity="0.35"/>
    </linearGradient>
  </defs>
  <rect width="640" height="360" rx="22" fill="#0b1020"/>
  <rect x="16" y="16" width="608" height="328" rx="18" fill="url(#g)" opacity="0.85"/>
  <rect x="28" y="28" width="584" height="304" rx="16" fill="#0b1020" opacity="0.7"/>
  <text x="48" y="86" fill="#e5e7eb" font-family="ui-sans-serif,system-ui" font-size="22" font-weight="700">${title.replace(
    /[<>&]/g,
    ""
  )}</text>
  <text x="48" y="116" fill="#9ca3af" font-family="ui-sans-serif,system-ui" font-size="14">Demo görsel • İstersen wiki görsellerini bağlarız</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function StarRow({ score }: { score: number }) {
  const rounded = Math.round(score * 2) / 2;
  const full = Math.floor(rounded);
  const half = rounded - full >= 0.5;
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const isFull = i < full;
        const isHalf = i === full && half;
        return (
          <span
            key={i}
            className={cn("inline-block text-xs", isFull ? "text-white" : "text-white/40")}
            aria-hidden
          >
            {isFull ? "★" : isHalf ? "⯨" : "☆"}
          </span>
        );
      })}
      <span className="ml-1 text-xs text-white/60">{Number.isFinite(score) ? score.toFixed(1) : "-"}</span>
    </div>
  );
}

function NavPill({
  item,
  active,
  onClick,
}: {
  item: (typeof NAV)[number];
  active: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group inline-flex shrink-0 items-center gap-2 rounded-2xl border px-3 py-2 text-sm shadow-sm transition",
        "bg-gradient-to-r",
        item.tone,
        "border-white/10",
        active ? "ring-1 ring-white/20" : "hover:ring-1 hover:ring-white/10",
        active ? "scale-[1.01]" : "hover:scale-[1.01]"
      )}
    >
      <span className="rounded-xl border border-white/10 bg-white/5 p-1.5 shadow-sm backdrop-blur">
        <Icon className="h-4 w-4 text-white" />
      </span>
      <span className="font-medium text-white">{item.label}</span>
    </button>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  subtitle,
  right,
}: {
  icon: any;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className="mt-1 rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/25 to-cyan-500/10 p-2 shadow-sm">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold leading-tight text-white md:text-xl">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-white/60">{subtitle}</p> : null}
        </div>
      </div>
      {right}
    </div>
  );
}

function AdSlot({ label, size }: { label: string; size: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-3 text-center">
      <div className="text-xs uppercase tracking-[0.2em] text-white/40">Reklam</div>
      <div className="mt-1 text-sm font-semibold text-white">{label}</div>
      <div className="mt-2 rounded-xl border border-white/10 bg-[#0b1020] px-3 py-6 text-xs text-white/60">
        {size} yerleşimi
      </div>
    </div>
  );
}

// ---- DATA MODEL ----
type ModeKey = "farm" | "boss" | "pvp" | "dengeli";

type GearItem = {
  slot:
    | "Silah"
    | "Zırh"
    | "Kask"
    | "Kalkan"
    | "Ayakkabı"
    | "Kolye"
    | "Küpe"
    | "Bilezik"
    | "Yüzük"
    | "Tılsım"
    | "Kostüm";
  name: string;
  img?: string;
  plus: string;
  bonuses: string[];
  notes?: string;
};

type ProgressionBlock = {
  rangeLabel: string;
  focus: string;
  recommendedPlus: string;
  items: GearItem[];
};

type LocationInfo = {
  title: string;
  mapName: string;
  img?: string;
  howToGet: string[];
  coords?: string;
};

type ModeGuide = {
  title: string;
  intro: string;
  priorities: string[];
  skillPlan: { title: string; items: string[] }[];
  progression: ProgressionBlock[];
};

type ContentEntry = {
  id: string;
  page: (typeof NAV)[number]["key"];
  title: string;
  tags?: string[];
  score?: number;
  heroImg?: string;
  blurb?: string;
  // her karakter içerik için 4 mod rehberi
  modes?: Record<ModeKey, ModeGuide>;
  locations?: LocationInfo[];
};

// ---- Reusable progression template ----
function progressionTemplate(params: {
  weaponName: (range: string) => string;
  armorName: (range: string) => string;
  classLogoFile?: string;
  weaponFile?: (range: string) => string | undefined;
  armorFile?: (range: string) => string | undefined;
  extras?: (range: string) => GearItem[];
}): ProgressionBlock[] {
  const blocks = [
    { range: "1–15", plus: "+3 / +4", focus: "Görev + hızlı seviye" },
    { range: "16–30", plus: "+5 / +6", focus: "Metin + temel farm" },
    { range: "31–45", plus: "+6 / +7", focus: "Farm hızlanır" },
    { range: "46–55", plus: "+7 / +8", focus: "Boss hazırlığı" },
    { range: "56–70", plus: "+8", focus: "Zindan odak" },
    { range: "71–75", plus: "+8 / +9", focus: "İçerik setleri" },
    { range: "76–90", plus: "+9", focus: "Boss + zindan" },
    { range: "91–99", plus: "+9 (full)", focus: "PvP set + optimizasyon" },
  ];

  return blocks.map((b) => {
    const extras = params.extras ? params.extras(b.range) : [];
    return {
      rangeLabel: b.range,
      focus: b.focus,
      recommendedPlus: b.plus,
      items: [
        {
          slot: "Silah",
          name: params.weaponName(b.range),
          img: maybeWikiImg(params.weaponFile ? params.weaponFile(b.range) : undefined),
          plus: b.plus.includes("+9") ? "+9" : b.plus.split(" ")[0],
          bonuses: ["Ortalama zarar", "Kritik", "Delici"],
          notes: "TR meta: farm için ortalama/kritik/delici temel.",
        },
        {
          slot: "Zırh",
          name: params.armorName(b.range),
          img: maybeWikiImg(params.armorFile ? params.armorFile(b.range) : undefined),
          plus: b.plus.includes("+9") ? "+9" : b.plus.split(" ")[0],
          bonuses: ["HP", "Ok direnci (gerektiğinde)", "Element direnci (içeriğe göre)"],
          notes: "Boss/zindan için içerik bazlı direnç seti kur.",
        },
        {
          slot: "Kalkan",
          name: "Kalkan (seviye aralığına uygun)",
          img: undefined,
          plus: b.plus.includes("+9") ? "+9" : "+6+",
          bonuses: ["Blok", "Savunma", "Ok savunması (opsiyonel)"],
        },
        {
          slot: "Kolye",
          name: "Kolye (HP / element / kritik ihtiyacına göre)",
          img: undefined,
          plus: "-",
          bonuses: ["HP", "Direnç"],
        },
        {
          slot: "Yüzük",
          name: "Yüzük (HP / kritik / delici)",
          img: undefined,
          plus: "-",
          bonuses: ["HP", "Kritik"],
        },
        ...extras,
      ],
    };
  });
}

// ---- Guides per character (high-level, expandable) ----
function makeModeGuide(params: {
  mode: ModeKey;
  title: string;
  intro: string;
  priorities: string[];
  skillPlan: { title: string; items: string[] }[];
  progression: ProgressionBlock[];
}): ModeGuide {
  return {
    title: params.title,
    intro: params.intro,
    priorities: params.priorities,
    skillPlan: params.skillPlan,
    progression: params.progression,
  };
}

const CONTENT: ContentEntry[] = [
  // ---- WARRIOR ----
  {
    id: "char-warrior",
    page: "karakterler",
    title: "Savaşçı — Beden / Zihin (TR)",
    tags: ["Savaşçı", "TR"],
    score: 4.9,
    heroImg: wikiImg("Savaşçı.png"),
    blurb: "Farm + Boss + PvP + Dengeli. Seviye blokları: 1–99.",
    modes: {
      farm: makeModeGuide({
        mode: "farm",
        title: "Farm Rehberi",
        intro:
          "Amaç: metin + harita farmında en hızlı temizleme. Ortalama/kritik/delici ile hasar tavanlanır; HP ile ayakta kalırsın.",
        priorities: ["Ortalama zarar", "Kritik", "Delici", "Saldırı değeri", "HP"],
        skillPlan: [
          { title: "Beden Savaşçı (genel)", items: ["3 Yönlü Kesme", "Öfke", "Kılıç Çevirme", "Hamle"] },
          { title: "Zihin Savaşçı (farm)", items: ["Zihinsel Güç", "Kılıç Çevirme", "Hamle", "Korku"] },
        ],
        progression: progressionTemplate({
          weaponName: (r) => `Silah (Farm) — ${r}`,
          armorName: (r) => `Zırh (Farm) — ${r}`,
          extras: (r) =>
            r === "76–90" || r === "91–99"
              ? [
                  {
                    slot: "Tılsım",
                    name: "Element Tılsımı (farm haritasına göre)",
                    img: undefined,
                    plus: "+1+",
                    bonuses: ["Element gücü", "Element direnci"],
                  },
                ]
              : [],
        }),
      }),
      boss: makeModeGuide({
        mode: "boss",
        title: "Boss Rehberi",
        intro:
          "Amaç: boss’u güvenli kesmek. Hasar kadar dayanıklılık ve içerik direnci kritik. Boss’a göre set değiştir.",
        priorities: ["Güçlü vs Canavar", "HP", "Element direnci", "Ok/Büyü direnci", "Kritik/Delici"],
        skillPlan: [
          { title: "Boss Mantığı", items: ["Direnç seti kur", "İksir/altar yönet", "Kanal/respawn planı"] },
        ],
        progression: progressionTemplate({
          weaponName: (r) => `Silah (Boss) — ${r}`,
          armorName: (r) => `Zırh (Boss/Direnç) — ${r}`,
          extras: (r) =>
            [
              {
                slot: "Küpe",
                name: "Küpe (direnç/HP)",
                plus: "-",
                bonuses: ["HP", "Direnç"],
              },
            ].concat(
              r === "56–70" || r === "71–75" || r === "76–90" || r === "91–99"
                ? [
                    {
                      slot: "Tılsım",
                      name: "Boss Element Tılsımı",
                      plus: "+1+",
                      bonuses: ["Element direnci", "Element gücü"],
                    },
                  ]
                : []
            ),
        }),
      }),
      pvp: makeModeGuide({
        mode: "pvp",
        title: "PvP Rehberi",
        intro:
          "Amaç: rakibe göre set değiştirmek. PvP’de ‘tek set’ yok: sınıf direnci + ok/büyü direnci + HP yönetimi önemlidir.",
        priorities: ["Sınıf direnci", "Ok direnci", "Büyü direnci", "HP", "Kritik/Delici"],
        skillPlan: [
          { title: "PvP Setleri", items: ["Okçuya karşı ok direnci", "Suralara büyü direnci", "Kritik/delici kırma"] },
        ],
        progression: progressionTemplate({
          weaponName: (r) => `Silah (PvP) — ${r}`,
          armorName: (r) => `Zırh (PvP) — ${r}`,
          extras: () => [
            {
              slot: "Kostüm",
              name: "Kostüm/efekt (opsiyonel)",
              plus: "-",
              bonuses: ["Duruma göre"],
            },
          ],
        }),
      }),
      dengeli: makeModeGuide({
        mode: "dengeli",
        title: "Dengeli Rehber",
        intro:
          "Amaç: farm + boss + PvP arasında sıkışmadan ilerlemek. Önce farm seti, sonra direnç seti, en sonda PvP seti.",
        priorities: ["Ortalama", "HP", "Kritik/Delici", "Güçlü vs Canavar", "Direnç"],
        skillPlan: [
          { title: "Yol Haritası", items: ["1) Farm set", "2) Boss/zindan direnç set", "3) PvP set"] },
        ],
        progression: progressionTemplate({
          weaponName: (r) => `Silah (Dengeli) — ${r}`,
          armorName: (r) => `Zırh (Dengeli) — ${r}`,
          extras: (r) =>
            r === "46–55" || r === "56–70" || r === "71–75" || r === "76–90" || r === "91–99"
              ? [
                  {
                    slot: "Tılsım",
                    name: "Element Tılsımı (içeriğe göre)",
                    plus: "+1+",
                    bonuses: ["Element direnci"],
                  },
                ]
              : [],
        }),
      }),
    },
    locations: [
      {
        title: "Farm Konumları (şablon)",
        mapName: "Harita bazlı",
        img: makeSvgDataUri("Harita: Farm", "#34d399"),
        howToGet: [
          "Bu bölüm: seviye aralığına göre harita harita doldurulur.",
          "Örn: 1–30, 31–55, 56–75, 76–99 bölgeleri.",
        ],
      },
    ],
  },

  // ---- SURA ----
  {
    id: "char-sura",
    page: "karakterler",
    title: "Sura — Büyülü Silah / Kara Büyü (TR)",
    tags: ["Sura", "TR"],
    score: 4.8,
    heroImg: wikiImg("Sura.png"),
    blurb: "Farm + Boss + PvP + Dengeli. 1–99 blok rehber.",
    modes: {
      farm: makeModeGuide({
        mode: "farm",
        title: "Farm Rehberi",
        intro:
          "Büyülü Silah: sürdürülebilir farm; Kara Büyü: alan hasarı ve kesim. TR’de farm için hasar + sürdürülebilirlik önemli.",
        priorities: ["Ortalama", "Kritik", "Delici", "HP", "Büyü hızı (gerektiğinde)"],
        skillPlan: [
          { title: "Büyülü Silah", items: ["Büyülü Silah", "Karanlık Darbe", "Korku", "Ejderha Girdabı"] },
          { title: "Kara Büyü", items: ["Kara Büyü", "Karanlık Küre", "Alev Hayaleti", "Karanlık Darbe"] },
        ],
        progression: progressionTemplate({
          weaponName: (r) => `Silah (Farm) — ${r}`,
          armorName: (r) => `Zırh (Farm) — ${r}`,
          extras: (r) =>
            r === "56–70" || r === "71–75" || r === "76–90" || r === "91–99"
              ? [
                  {
                    slot: "Tılsım",
                    name: "Element Tılsımı (farm haritasına göre)",
                    plus: "+1+",
                    bonuses: ["Element gücü", "Element direnci"],
                  },
                ]
              : [],
        }),
      }),
      boss: makeModeGuide({
        mode: "boss",
        title: "Boss Rehberi",
        intro:
          "Boss’ta: güçlü vs canavar + direnç seti. Sura’nın avantajı: sürdürülebilirlik ve tek hedef hasarı.",
        priorities: ["Güçlü vs Canavar", "HP", "Element direnci", "Büyü direnci", "Kritik/Delici"],
        skillPlan: [{ title: "Boss Rutini", items: ["Set değiştir", "Tılsım/direnç ayarla", "Kontrollü çek"] }],
        progression: progressionTemplate({
          weaponName: (r) => `Silah (Boss) — ${r}`,
          armorName: (r) => `Zırh (Direnç) — ${r}`,
        }),
      }),
      pvp: makeModeGuide({
        mode: "pvp",
        title: "PvP Rehberi",
        intro:
          "PvP’de: rakibe göre büyü/ok/sınıf direnci. Kara Büyü kontrol, Büyülü Silah sürdürülebilirlik sağlar.",
        priorities: ["Büyü direnci", "Ok direnci", "Sınıf direnci", "HP", "Kritik/Delici"],
        skillPlan: [{ title: "PvP Mantığı", items: ["Rakip sınıfına göre direnç", "Zayıf noktayı hedefle"] }],
        progression: progressionTemplate({
          weaponName: (r) => `Silah (PvP) — ${r}`,
          armorName: (r) => `Zırh (PvP) — ${r}`,
        }),
      }),
      dengeli: makeModeGuide({
        mode: "dengeli",
        title: "Dengeli Rehber",
        intro:
          "İlerleyiş: önce farm, sonra direnç, sonra PvP. Sura’da sürdürülebilirlik nedeniyle dengeli ilerlemek kolaydır.",
        priorities: ["Ortalama", "HP", "Direnç", "Güçlü vs Canavar", "Kritik/Delici"],
        skillPlan: [{ title: "Yol Haritası", items: ["Farm set → Direnç set → PvP set"] }],
        progression: progressionTemplate({
          weaponName: (r) => `Silah (Dengeli) — ${r}`,
          armorName: (r) => `Zırh (Dengeli) — ${r}`,
        }),
      }),
    },
    locations: [
      {
        title: "Farm Konumları (şablon)",
        mapName: "Harita bazlı",
        img: makeSvgDataUri("Harita: Sura", "#a78bfa"),
        howToGet: ["Seviye aralıklarına göre harita harita doldurulacak."],
      },
    ],
  },

  // ---- NINJA ----
  {
    id: "char-ninja",
    page: "karakterler",
    title: "Ninja — Yakın Dövüş / Okçu (TR)",
    tags: ["Ninja", "TR"],
    score: 4.8,
    heroImg: wikiImg("Ninja.png"),
    blurb: "Farm + Boss + PvP + Dengeli. 1–99 blok rehber.",
    modes: {
      farm: makeModeGuide({
        mode: "farm",
        title: "Farm Rehberi",
        intro:
          "Yakın dövüş: hızlı kesim; Okçu: güvenli farm. Farm’ta kritik/delici ve ortalama çok etkili.",
        priorities: ["Ortalama", "Kritik", "Delici", "Saldırı hızı", "HP"],
        skillPlan: [
          { title: "Yakın Dövüş", items: ["Hızlı Saldırı", "Zehirli Bulut", "Gizlenme", "Kılıç Rüzgarı"] },
          { title: "Okçu", items: ["Ateşli Ok", "Ok Yağmuru", "Zehirli Ok", "Hızlı Koşu"] },
        ],
        progression: progressionTemplate({
          weaponName: (r) => `Silah/Yay (Farm) — ${r}`,
          armorName: (r) => `Zırh (Farm) — ${r}`,
          extras: (r) =>
            r === "76–90" || r === "91–99"
              ? [
                  {
                    slot: "Ayakkabı",
                    name: "Ayakkabı (hız + kaçınma)",
                    plus: "+6+",
                    bonuses: ["Hareket hızı", "Kaçınma"],
                  },
                ]
              : [],
        }),
      }),
      boss: makeModeGuide({
        mode: "boss",
        title: "Boss Rehberi",
        intro:
          "Boss’ta: güvenli pozisyon, okçu avantajlı olabilir. Direnç seti + güçlü vs canavar öncelik.",
        priorities: ["Güçlü vs Canavar", "HP", "Ok/Büyü direnci", "Element direnci", "Kritik/Delici"],
        skillPlan: [{ title: "Boss Rutini", items: ["Mesafe/pozisyon", "Direnç seti", "İksir yönetimi"] }],
        progression: progressionTemplate({
          weaponName: (r) => `Silah/Yay (Boss) — ${r}`,
          armorName: (r) => `Zırh (Direnç) — ${r}`,
        }),
      }),
      pvp: makeModeGuide({
        mode: "pvp",
        title: "PvP Rehberi",
        intro:
          "PvP’de ninja: hız ve ani hasar. Okçu: menzil kontrol. Sınıf direnci + ok/büyü direnci kritik.",
        priorities: ["Ok direnci", "Büyü direnci", "Sınıf direnci", "HP", "Kritik/Delici"],
        skillPlan: [{ title: "PvP Mantığı", items: ["Gizlenme/pozisyon", "Hız seti", "Set değişimi"] }],
        progression: progressionTemplate({
          weaponName: (r) => `Silah/Yay (PvP) — ${r}`,
          armorName: (r) => `Zırh (PvP) — ${r}`,
        }),
      }),
      dengeli: makeModeGuide({
        mode: "dengeli",
        title: "Dengeli Rehber",
        intro:
          "Önce farm seti, sonra direnç, sonra PvP. Ninja’da hareket hızı ve kritik dengeli ilerleyişte önemli.",
        priorities: ["Ortalama", "HP", "Kritik/Delici", "Direnç", "Hareket hızı"],
        skillPlan: [{ title: "Yol Haritası", items: ["Farm set → Direnç set → PvP set"] }],
        progression: progressionTemplate({
          weaponName: (r) => `Silah/Yay (Dengeli) — ${r}`,
          armorName: (r) => `Zırh (Dengeli) — ${r}`,
        }),
      }),
    },
    locations: [
      {
        title: "Farm Konumları (şablon)",
        mapName: "Harita bazlı",
        img: makeSvgDataUri("Harita: Ninja", "#fb7185"),
        howToGet: ["Seviye aralıklarına göre harita harita doldurulacak."],
      },
    ],
  },

  // ---- SHAMAN ----
  {
    id: "char-shaman",
    page: "karakterler",
    title: "Şaman — Ejderha / Şifa (TR)",
    tags: ["Şaman", "TR"],
    score: 4.7,
    heroImg: wikiImg("Şaman.png"),
    blurb: "Farm + Boss + PvP + Dengeli. 1–99 blok rehber.",
    modes: {
      farm: makeModeGuide({
        mode: "farm",
        title: "Farm Rehberi",
        intro:
          "Ejderha: hasar + buff; Şifa: destek ve sürdürülebilirlik. Farm’ta ortalama/kritik/delici + büyü hızı duruma göre.",
        priorities: ["Ortalama", "Kritik", "Delici", "HP", "Büyü hızı"],
        skillPlan: [
          { title: "Ejderha", items: ["Ejderha Yardımı", "Kutsama", "Ejderha Atışı", "Ejderha Gürlemesi"] },
          { title: "Şifa", items: ["Kutsama", "Yansıtma", "Şimşek Atışı", "Hız"] },
        ],
        progression: progressionTemplate({
          weaponName: (r) => `Yelpaze/Çan (Farm) — ${r}`,
          armorName: (r) => `Zırh (Farm) — ${r}`,
        }),
      }),
      boss: makeModeGuide({
        mode: "boss",
        title: "Boss Rehberi",
        intro:
          "Boss’ta şaman: buff ile takım/solo güçlenir. Direnç seti + güçlü vs canavar öncelik.",
        priorities: ["Güçlü vs Canavar", "HP", "Element direnci", "Büyü direnci", "Büyü hızı"],
        skillPlan: [{ title: "Boss Rutini", items: ["Buff yönet", "Direnç seti", "Pozisyon"] }],
        progression: progressionTemplate({
          weaponName: (r) => `Yelpaze/Çan (Boss) — ${r}`,
          armorName: (r) => `Zırh (Direnç) — ${r}`,
        }),
      }),
      pvp: makeModeGuide({
        mode: "pvp",
        title: "PvP Rehberi",
        intro:
          "PvP’de şaman: kontrol + dayanıklılık. Büyü/ok direnci + sınıf direnci ve HP şart.",
        priorities: ["Büyü direnci", "Ok direnci", "Sınıf direnci", "HP", "Büyü hızı"],
        skillPlan: [{ title: "PvP Mantığı", items: ["Rakibe göre direnç", "Buff + pozisyon", "Set değişimi"] }],
        progression: progressionTemplate({
          weaponName: (r) => `Yelpaze/Çan (PvP) — ${r}`,
          armorName: (r) => `Zırh (PvP) — ${r}`,
        }),
      }),
      dengeli: makeModeGuide({
        mode: "dengeli",
        title: "Dengeli Rehber",
        intro:
          "Şaman için dengeli: farm seti + direnç seti + PvP seti. Bufflar sayesinde geçiş kolay.",
        priorities: ["Ortalama", "HP", "Direnç", "Büyü hızı", "Güçlü vs Canavar"],
        skillPlan: [{ title: "Yol Haritası", items: ["Farm set → Direnç set → PvP set"] }],
        progression: progressionTemplate({
          weaponName: (r) => `Yelpaze/Çan (Dengeli) — ${r}`,
          armorName: (r) => `Zırh (Dengeli) — ${r}`,
        }),
      }),
    },
    locations: [
      {
        title: "Farm Konumları (şablon)",
        mapName: "Harita bazlı",
        img: makeSvgDataUri("Harita: Şaman", "#22d3ee"),
        howToGet: ["Seviye aralıklarına göre harita harita doldurulacak."],
      },
    ],
  },

  // ---- LYCAN (TR'de varsa) ----
  {
    id: "char-lycan",
    page: "karakterler",
    title: "Lycan — Pençe (TR)",
    tags: ["Lycan", "TR"],
    score: 4.6,
    heroImg: wikiImg("Lycan.png"),
    blurb: "Farm + Boss + PvP + Dengeli. 1–99 blok rehber.",
    modes: {
      farm: makeModeGuide({
        mode: "farm",
        title: "Farm Rehberi",
        intro:
          "Lycan: yüksek yakın dövüş hasarı. Farm’ta ortalama/kritik/delici + HP ile stabil farm.",
        priorities: ["Ortalama", "Kritik", "Delici", "HP", "Saldırı değeri"],
        skillPlan: [{ title: "Genel", items: ["Ana hasar skilleri", "Hız/pozisyon"] }],
        progression: progressionTemplate({
          weaponName: (r) => `Pençe (Farm) — ${r}`,
          armorName: (r) => `Zırh (Farm) — ${r}`,
        }),
      }),
      boss: makeModeGuide({
        mode: "boss",
        title: "Boss Rehberi",
        intro:
          "Boss’ta: güçlü vs canavar + direnç seti. Lycan yakın dövüş olduğu için dayanıklılık kritik.",
        priorities: ["Güçlü vs Canavar", "HP", "Element direnci", "Ok/Büyü direnci", "Kritik/Delici"],
        skillPlan: [{ title: "Boss Rutini", items: ["Direnç seti", "İksir", "Pozisyon"] }],
        progression: progressionTemplate({
          weaponName: (r) => `Pençe (Boss) — ${r}`,
          armorName: (r) => `Zırh (Direnç) — ${r}`,
        }),
      }),
      pvp: makeModeGuide({
        mode: "pvp",
        title: "PvP Rehberi",
        intro:
          "PvP’de: sınıf direnci + ok/büyü direnci + HP. Lycan için hız/pozisyon çok önemli.",
        priorities: ["Sınıf direnci", "Ok direnci", "Büyü direnci", "HP", "Kritik/Delici"],
        skillPlan: [{ title: "PvP Mantığı", items: ["Set değişimi", "Pozisyon", "Ani hasar"] }],
        progression: progressionTemplate({
          weaponName: (r) => `Pençe (PvP) — ${r}`,
          armorName: (r) => `Zırh (PvP) — ${r}`,
        }),
      }),
      dengeli: makeModeGuide({
        mode: "dengeli",
        title: "Dengeli Rehber",
        intro:
          "Farm → direnç → PvP sırası. Lycan’da HP ve direnç yatırımını erken yapmak faydalı.",
        priorities: ["Ortalama", "HP", "Direnç", "Güçlü vs Canavar", "Kritik/Delici"],
        skillPlan: [{ title: "Yol Haritası", items: ["Farm set → Direnç set → PvP set"] }],
        progression: progressionTemplate({
          weaponName: (r) => `Pençe (Dengeli) — ${r}`,
          armorName: (r) => `Zırh (Dengeli) — ${r}`,
        }),
      }),
    },
    locations: [
      {
        title: "Farm Konumları (şablon)",
        mapName: "Harita bazlı",
        img: makeSvgDataUri("Harita: Lycan", "#f59e0b"),
        howToGet: ["Seviye aralıklarına göre harita harita doldurulacak."],
      },
    ],
  },

  // ---- Systems/bonus pages (starter) ----
  {
    id: "sys-efsun",
    page: "efsunlar",
    title: "Efsunlar — Farm/Boss/PvP Set Mantığı",
    tags: ["Efsun", "Set"],
    score: 4.7,
    heroImg: makeSvgDataUri("Efsunlar", "#a78bfa"),
    blurb: "Bölüm bölüm: farm seti, boss seti, pvp seti (doldurulabilir).",
    modes: {
      farm: makeModeGuide({
        mode: "farm",
        title: "Farm Efsun",
        intro: "Farm’ta hedef: hızlı kesim + stabil kalma.",
        priorities: ["Ortalama", "Kritik", "Delici", "Saldırı değeri", "HP"],
        skillPlan: [{ title: "Genel", items: ["Efsunları slot bazlı ayır", "Silah = hasar, Zırh = dayanıklılık"] }],
        progression: [
          {
            rangeLabel: "Slot Bazlı (genel)",
            focus: "Farm set şablonu",
            recommendedPlus: "+6 → +7 → +8 → +9",
            items: [
              { slot: "Silah", name: "Silah efsun", plus: "-", bonuses: ["Ortalama", "Kritik", "Delici"] },
              { slot: "Zırh", name: "Zırh efsun", plus: "-", bonuses: ["HP", "Ok direnci (gerektiğinde)"] },
              { slot: "Kalkan", name: "Kalkan efsun", plus: "-", bonuses: ["Blok", "Savunma"] },
            ],
          },
        ],
      }),
      boss: makeModeGuide({
        mode: "boss",
        title: "Boss Efsun",
        intro: "Boss’ta set, boss’a göre değişir.",
        priorities: ["Güçlü vs Canavar", "Element direnci", "HP", "Ok/Büyü direnci"],
        skillPlan: [{ title: "Genel", items: ["Boss’a göre element/direnç ayarla"] }],
        progression: [
          {
            rangeLabel: "Slot Bazlı (genel)",
            focus: "Boss set şablonu",
            recommendedPlus: "+8+",
            items: [
              { slot: "Silah", name: "Silah efsun", plus: "-", bonuses: ["Güçlü vs Canavar", "Kritik/Delici"] },
              { slot: "Zırh", name: "Zırh efsun", plus: "-", bonuses: ["Element direnci", "HP"] },
              { slot: "Tılsım", name: "Tılsım", plus: "+1+", bonuses: ["Element direnci", "Element gücü"] },
            ],
          },
        ],
      }),
      pvp: makeModeGuide({
        mode: "pvp",
        title: "PvP Efsun",
        intro: "PvP’de rakibe göre set değişimi şart.",
        priorities: ["Sınıf direnci", "Ok direnci", "Büyü direnci", "HP"],
        skillPlan: [{ title: "Genel", items: ["Okçuya vs ok", "Sura/Şaman’a vs büyü", "Savaşçıya vs sınıf"] }],
        progression: [
          {
            rangeLabel: "Slot Bazlı (genel)",
            focus: "PvP set şablonu",
            recommendedPlus: "+9",
            items: [
              { slot: "Zırh", name: "Zırh efsun", plus: "-", bonuses: ["Sınıf direnci", "HP"] },
              { slot: "Kalkan", name: "Kalkan efsun", plus: "-", bonuses: ["Ok savunması", "Blok"] },
              { slot: "Ayakkabı", name: "Ayakkabı efsun", plus: "-", bonuses: ["Hareket hızı", "Kaçınma"] },
            ],
          },
        ],
      }),
      dengeli: makeModeGuide({
        mode: "dengeli",
        title: "Dengeli Efsun",
        intro: "Önce farm seti, sonra direnç seti, en son PvP.",
        priorities: ["Ortalama", "HP", "Direnç", "Güçlü vs Canavar"],
        skillPlan: [{ title: "Sıralama", items: ["Farm → Boss → PvP"] }],
        progression: [
          {
            rangeLabel: "Geçiş Planı",
            focus: "Setleri sırayla kur",
            recommendedPlus: "-",
            items: [
              { slot: "Silah", name: "Farm silahı", plus: "-", bonuses: ["Ortalama/Kritik/Delici"] },
              { slot: "Zırh", name: "Direnç zırhı", plus: "-", bonuses: ["HP/Direnç"] },
              { slot: "Kalkan", name: "PvP kalkanı", plus: "-", bonuses: ["Ok savunması/Blok"] },
            ],
          },
        ],
      }),
    },
    locations: [
      {
        title: "Efsun Nereden Alınır?",
        mapName: "NPC / Etkinlik / Sandık",
        img: makeSvgDataUri("Efsun Kaynak", "#fb7185"),
        howToGet: ["TR’de efsun nesneleri genelde etkinlik/pazar/sandık üzerinden döner."],
      },
    ],
  },
];

// ---- Demo chart ----
const DAMAGE_SERIES = [
  { lvl: 30, dmg: 450 },
  { lvl: 40, dmg: 680 },
  { lvl: 50, dmg: 980 },
  { lvl: 60, dmg: 1350 },
  { lvl: 70, dmg: 1900 },
  { lvl: 75, dmg: 2300 },
  { lvl: 80, dmg: 2800 },
  { lvl: 90, dmg: 3600 },
];

// ---- sanity checks (dev) ----
(function runSanityChecks() {
  try {
    const navKeys = new Set(NAV.map((n) => n.key));
    console.assert(navKeys.size === NAV.length, "NAV key'leri benzersiz olmalı");

    const ids = new Set(CONTENT.map((c) => c.id));
    console.assert(ids.size === CONTENT.length, "CONTENT id'leri benzersiz olmalı");

    const invalidPages = CONTENT.filter((c) => c.page && !navKeys.has(c.page));
    console.assert(invalidPages.length === 0, "CONTENT.page NAV içinde olmalı", invalidPages);

    // mode checks
    CONTENT.forEach((c) => {
      if (c.modes) {
        const required: ModeKey[] = ["farm", "boss", "pvp", "dengeli"];
        required.forEach((k) => console.assert(!!c.modes?.[k], `Eksik mod: ${k} (${c.id})`));
      }
    });
  } catch {
    // ignore
  }
})();

function ItemPill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/70">{label}</span>
  );
}

function GearCard({ item }: { item: GearItem }) {
  const img = item.img && item.img.startsWith("http") ? item.img : item.img || makeSvgDataUri(item.name, "#a78bfa");
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="flex gap-3">
        <img
          src={img}
          alt={item.name}
          loading="lazy"
          decoding="async"
          className="h-20 w-28 rounded-xl border border-white/10 object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white">{item.name}</div>
              <div className="mt-0.5 text-xs text-white/60">{item.slot}</div>
            </div>
            <Badge variant="secondary" className="rounded-full bg-white/10 text-white">
              {item.plus}
            </Badge>
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {item.bonuses.map((b) => (
              <ItemPill key={b} label={b} />
            ))}
          </div>

          {item.notes ? <div className="mt-2 text-xs text-white/55">{item.notes}</div> : null}
        </div>
      </div>
    </div>
  );
}

function ProgressionBlockView({ block }: { block: ProgressionBlock }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-white">{block.rangeLabel}</div>
          <div className="mt-1 text-xs text-white/60">Odak: {block.focus}</div>
        </div>
        <Badge className="rounded-full bg-gradient-to-r from-violet-500/30 to-cyan-500/20 text-white" variant="secondary">
          Önerilen +: {block.recommendedPlus}
        </Badge>
      </div>

      <div className="mt-3 grid gap-3">
        {block.items.map((it) => (
          <GearCard key={`${block.rangeLabel}-${it.slot}-${it.name}`} item={it} />
        ))}
      </div>
    </div>
  );
}

function LocationCard({ loc }: { loc: LocationInfo }) {
  const img = loc.img && loc.img.startsWith("http") ? loc.img : loc.img || makeSvgDataUri(loc.mapName, "#22d3ee");
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="flex flex-col gap-3 md:flex-row">
        <img
          src={img}
          alt={loc.mapName}
          loading="lazy"
          decoding="async"
          className="h-40 w-full rounded-xl border border-white/10 object-cover md:h-40 md:w-64"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-sm font-semibold text-white">{loc.title}</div>
              <div className="mt-1 text-xs text-white/60">Harita: {loc.mapName}</div>
              {loc.coords ? <div className="mt-1 text-xs text-white/55">Konum: {loc.coords}</div> : null}
            </div>
            <Badge variant="secondary" className="rounded-full bg-white/10 text-white">
              Konum
            </Badge>
          </div>

          <div className="mt-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-white/70" />
              <div className="text-sm font-semibold text-white">Nereden alınır / nasıl yapılır?</div>
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/70">
              {loc.howToGet.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModeBadge({ mode }: { mode: ModeKey }) {
  const meta: Record<ModeKey, { label: string; Icon: any }> = {
    farm: { label: "Farm", Icon: Coins },
    boss: { label: "Boss", Icon: Skull },
    pvp: { label: "PvP", Icon: Crosshair },
    dengeli: { label: "Dengeli", Icon: HeartPulse },
  };
  const M = meta[mode];
  return (
    <Badge className="rounded-full bg-white/10 text-white" variant="secondary">
      <M.Icon className="mr-1 h-3.5 w-3.5" /> {M.label}
    </Badge>
  );
}

export default function Metin2PortalPreview() {
  const [page, setPage] = useState<(typeof NAV)[number]["key"]>("anasayfa");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("puan");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = CONTENT.filter((c) => {
      const matchesPage = page === "anasayfa" ? true : c.page === page;
      if (!matchesPage) return false;
      if (!q) return true;
      const hay = `${c.title} ${c.blurb ?? ""} ${(c.tags ?? []).join(" ")}`.toLowerCase();
      return hay.includes(q);
    });

    rows = [...rows].sort((a, b) => {
      if (sort === "puan") return (b.score ?? 0) - (a.score ?? 0);
      if (sort === "ad") return a.title.localeCompare(b.title);
      return 0;
    });
    return rows;
  }, [page, query, sort]);

  const activeNav = NAV.find((n) => n.key === page) ?? NAV[0];
  const ActiveIcon = activeNav.icon;

  return (
    <div className="dark">
      <div className="min-h-screen bg-[#070a14] bg-[radial-gradient(1200px_circle_at_20%_10%,rgba(139,92,246,0.20),transparent_45%),radial-gradient(900px_circle_at_80%_20%,rgba(34,211,238,0.16),transparent_45%),radial-gradient(900px_circle_at_50%_90%,rgba(244,63,94,0.10),transparent_45%)]">
        {/* Top bar */}
        <div className="sticky top-0 z-40 border-b border-white/10 bg-[#070a14]/70 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/25 to-cyan-500/10 p-2 shadow-sm">
                <Swords className="h-5 w-5 text-white" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold text-white">Metin2 TR Rehber</div>
                <div className="text-xs text-white/60">Karakter • Farm • Boss • PvP • Harita</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <ModeBadge mode="farm" />
              <ModeBadge mode="boss" />
              <ModeBadge mode="pvp" />
              <ModeBadge mode="dengeli" />
            </div>

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="h-10 w-44 rounded-2xl border border-white/10 bg-white/5 px-3 text-sm text-white"
            >
              <option value="puan">Puana göre</option>
              <option value="ad">Ada göre</option>
            </select>
          </div>

          {/* NAV: mobilde yatay kaydırma */}
          <div className="mx-auto max-w-6xl px-4 pb-3">
            <div className="-mx-1 overflow-x-auto px-1">
              <div className="flex flex-nowrap gap-2 pb-1 md:flex-wrap">
                {NAV.map((n) => (
                  <NavPill key={n.key} item={n} active={n.key === page} onClick={() => setPage(n.key)} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-6xl px-4 pt-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="grid gap-4 md:grid-cols-12"
          >
            <Card className="rounded-2xl border-white/10 bg-white/5 md:col-span-8">
              <CardContent className="p-6">
                <h1 className="text-2xl font-semibold tracking-tight text-white md:text-4xl">
                  {page === "anasayfa" ? "En İyi TR Rehber Portalı" : `${activeNav.label} — Rehberler`}
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-white/60 md:text-base">
                  Kartı açınca rehber direkt başlar. İçerik: Farm/Boss/PvP/Dengeli sekmeleri + Konum.
                </p>

                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Ara: savaşçı, sura, ninja, şaman, lycan, efsun..."
                      className="h-11 rounded-2xl border-white/10 bg-white/5 pl-10 text-white placeholder:text-white/40"
                    />
                  </div>
                  <Button
                    variant="secondary"
                    className="h-11 rounded-2xl bg-white/10 text-white hover:bg-white/15"
                    onClick={() => {
                      setQuery("");
                      setSort("puan");
                      setPage("anasayfa");
                    }}
                  >
                    Sıfırla
                  </Button>
                </div>

                <div className="mt-5 grid gap-2 sm:grid-cols-3">
                  {[
                    { title: "Karakter", desc: "1–99 set planları", icon: Swords, tone: "from-amber-500/25 to-rose-500/10" },
                    { title: "Boss/Zindan", desc: "Direnç + rota", icon: Skull, tone: "from-red-500/25 to-orange-500/10" },
                    { title: "Efsun/Taş", desc: "Slot bazlı mantık", icon: Wand2, tone: "from-fuchsia-500/25 to-indigo-500/10" },
                  ].map((b) => (
                    <div key={b.title} className={cn("rounded-2xl border border-white/10 bg-gradient-to-br p-4", b.tone)}>
                      <div className="flex items-center gap-2">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-2">
                          <b.icon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">{b.title}</div>
                          <div className="mt-1 text-xs text-white/60">{b.desc}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:col-span-4">
              <Card className="rounded-2xl border-white/10 bg-white/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-white">Gelişim Grafiği (Demo)</CardTitle>
                </CardHeader>
                <CardContent className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={DAMAGE_SERIES}>
                      <XAxis dataKey="lvl" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="dmg" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                  <p className="mt-2 text-xs text-white/60">İstersen bunu gerçek hesaplayıcıya çeviririz.</p>
                </CardContent>
              </Card>
              <AdSlot label="Sağ Sütun" size="300x250" />
            </div>
          </motion.div>

          <div className="mt-6">
            <AdSlot label="Üst Banner" size="728x90" />
          </div>

          {/* LIST */}
          <div className="mt-8 grid gap-4">
            <SectionTitle
              icon={ActiveIcon}
              title={page === "anasayfa" ? "Keşfet" : `${activeNav.label} Sayfası`}
              subtitle={page === "anasayfa" ? "Kategori seç veya arama ile bul." : "Önizle → Rehber"}
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((c) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                  <Card className="h-full rounded-2xl border border-white/10 bg-white/5 shadow-sm backdrop-blur">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base leading-snug text-white">{c.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex h-full flex-col">
                      <div className="flex flex-wrap gap-1.5">
                        {(c.tags ?? []).map((t) => (
                          <Badge key={t} className="rounded-full bg-white/10 text-white" variant="secondary">
                            {t}
                          </Badge>
                        ))}
                      </div>
                      {c.blurb ? <p className="mt-3 text-sm text-white/60">{c.blurb}</p> : null}

                      <div className="mt-4 flex items-center justify-between">
                        <StarRow score={c.score ?? 0} />
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className="rounded-2xl bg-gradient-to-r from-violet-600/80 to-cyan-600/80 text-white hover:opacity-95">
                              Önizle
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto rounded-2xl border-white/10 bg-[#070a14] text-white">
                            <DialogHeader>
                              <DialogTitle className="text-white">{c.title}</DialogTitle>
                              <DialogDescription className="text-white/60">
                                Rehber direkt açılır. İçerikler Farm/Boss/PvP/Dengeli + Konum.
                              </DialogDescription>
                            </DialogHeader>

                            <Tabs defaultValue="rehber">
                              <TabsList className="rounded-2xl bg-white/5">
                                <TabsTrigger value="rehber">Rehber</TabsTrigger>
                                <TabsTrigger value="konum">Konum</TabsTrigger>
                              </TabsList>

                              <TabsContent value="rehber" className="mt-3">
                                <div className="grid gap-3">
                                  <img
                                    src={c.heroImg ?? makeSvgDataUri(c.title)}
                                    alt={c.title}
                                    loading="lazy"
                                    decoding="async"
                                    className="h-44 w-full rounded-2xl border border-white/10 object-cover"
                                  />

                                  {c.modes ? (
                                    <Tabs defaultValue="farm">
                                      <TabsList className="rounded-2xl bg-white/5">
                                        <TabsTrigger value="farm">Farm</TabsTrigger>
                                        <TabsTrigger value="boss">Boss</TabsTrigger>
                                        <TabsTrigger value="pvp">PvP</TabsTrigger>
                                        <TabsTrigger value="dengeli">Dengeli</TabsTrigger>
                                      </TabsList>

                                      {(["farm", "boss", "pvp", "dengeli"] as ModeKey[]).map((mk) => {
                                        const g = c.modes?.[mk];
                                        if (!g) return null;
                                        const modeMeta: Record<ModeKey, { Icon: any; tint: string }> = {
                                          farm: { Icon: Coins, tint: "from-emerald-500/20 to-cyan-500/10" },
                                          boss: { Icon: Skull, tint: "from-red-500/20 to-orange-500/10" },
                                          pvp: { Icon: Crosshair, tint: "from-fuchsia-500/20 to-indigo-500/10" },
                                          dengeli: { Icon: HeartPulse, tint: "from-violet-500/20 to-sky-500/10" },
                                        };
                                        const Ico = modeMeta[mk].Icon;
                                        return (
                                          <TabsContent key={mk} value={mk} className="mt-3">
                                            <Card className={cn("rounded-2xl border-white/10 bg-gradient-to-br", modeMeta[mk].tint)}>
                                              <CardContent className="p-4">
                                                <div className="flex items-start justify-between gap-3">
                                                  <div className="flex items-start gap-2">
                                                    <div className="mt-0.5 rounded-xl border border-white/10 bg-white/5 p-2">
                                                      <Ico className="h-4 w-4 text-white" />
                                                    </div>
                                                    <div>
                                                      <div className="text-base font-semibold text-white">{g.title}</div>
                                                      <p className="mt-1 text-sm text-white/70">{g.intro}</p>
                                                    </div>
                                                  </div>
                                                  <div className="hidden items-center gap-2 md:flex">
                                                    <Badge className="rounded-full bg-white/10 text-white" variant="secondary">
                                                      {mk.toUpperCase()}
                                                    </Badge>
                                                  </div>
                                                </div>

                                                <div className="mt-4 grid gap-3 md:grid-cols-2">
                                                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                                    <div className="text-sm font-semibold text-white">Öncelikler</div>
                                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                                      {g.priorities.map((x) => (
                                                        <ItemPill key={x} label={x} />
                                                      ))}
                                                    </div>
                                                  </div>
                                                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                                    <div className="text-sm font-semibold text-white">Yetenek Planı</div>
                                                    <div className="mt-2 grid gap-2">
                                                      {g.skillPlan.map((sp) => (
                                                        <div key={sp.title} className="rounded-2xl border border-white/10 bg-white/5 p-2">
                                                          <div className="text-xs font-semibold text-white">{sp.title}</div>
                                                          <div className="mt-1 flex flex-wrap gap-1.5">
                                                            {sp.items.map((it) => (
                                                              <ItemPill key={it} label={it} />
                                                            ))}
                                                          </div>
                                                        </div>
                                                      ))}
                                                    </div>
                                                  </div>
                                                </div>

                                                <div className="mt-4 grid gap-3">
                                                  {g.progression.map((b) => (
                                                    <ProgressionBlockView key={b.rangeLabel} block={b} />
                                                  ))}
                                                </div>
                                              </CardContent>
                                            </Card>
                                          </TabsContent>
                                        );
                                      })}
                                    </Tabs>
                                  ) : (
                                    <Card className="rounded-2xl border-white/10 bg-white/5">
                                      <CardContent className="p-4">
                                        <p className="text-sm text-white/70">Bu içerik için mod rehberi yok.</p>
                                      </CardContent>
                                    </Card>
                                  )}
                                </div>
                              </TabsContent>

                              <TabsContent value="konum" className="mt-3">
                                <div className="grid gap-3">
                                  {c.locations?.length ? (
                                    c.locations.map((l) => <LocationCard key={`${c.id}-${l.title}`} loc={l} />)
                                  ) : (
                                    <Card className="rounded-2xl border-white/10 bg-white/5">
                                      <CardContent className="p-4">
                                        <p className="text-sm text-white/70">Bu içerik için konum bilgisi yok.</p>
                                      </CardContent>
                                    </Card>
                                  )}
                                </div>
                              </TabsContent>
                            </Tabs>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <AdSlot label="İçerik Arası" size="728x90" />
              <AdSlot label="İçerik Arası" size="300x250" />
            </div>

            <Card className="rounded-2xl border-white/10 bg-white/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-white">Hızlı Kısayollar</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-white/80" />
                    <div className="text-sm font-semibold text-white">Farm</div>
                  </div>
                  <p className="mt-2 text-xs text-white/60">Silah: ortalama/kritik/delici • Zırh: HP</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-white/80" />
                    <div className="text-sm font-semibold text-white">Boss</div>
                  </div>
                  <p className="mt-2 text-xs text-white/60">Güçlü vs canavar + element direnci seti</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center gap-2">
                    <HeartPulse className="h-4 w-4 text-white/80" />
                    <div className="text-sm font-semibold text-white">PvP</div>
                  </div>
                  <p className="mt-2 text-xs text-white/60">Sınıf/ok/büyü direnci + HP • set değişimi</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="pb-10" />
        </div>
      </div>
    </div>
  );
}
