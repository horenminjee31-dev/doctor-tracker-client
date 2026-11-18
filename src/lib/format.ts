const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const numberFormatter = new Intl.NumberFormat("en-US");

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return "—";
  return dateFormatter.format(new Date(value));
}

export function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return numberFormatter.format(value);
}

export function toDateInputValue(value: string | Date | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

export function initials(name: string) {
  return name
    .replace(/^Dr\.?\s*/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const avatarPalettes = [
  "bg-brand-100 text-brand-800",
  "bg-indigo-100 text-indigo-700",
  "bg-amber-100 text-amber-800",
  "bg-rose-100 text-rose-700",
  "bg-sky-100 text-sky-800",
  "bg-violet-100 text-violet-700",
];

export function avatarPalette(name: string) {
  const hash = Array.from(name).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatarPalettes[hash % avatarPalettes.length];
}

export function conditionTone(condition: string) {
  const tones: Record<string, string> = {
    Diabetes: "bg-amber-50 text-amber-700 ring-amber-200",
    Hypertension: "bg-rose-50 text-rose-700 ring-rose-200",
    Asthma: "bg-sky-50 text-sky-700 ring-sky-200",
    "Cardiac Arrhythmia": "bg-red-50 text-red-700 ring-red-200",
    Arthritis: "bg-orange-50 text-orange-700 ring-orange-200",
    Migraine: "bg-violet-50 text-violet-700 ring-violet-200",
    Dermatitis: "bg-pink-50 text-pink-700 ring-pink-200",
    "Thyroid Disorder": "bg-teal-50 text-teal-700 ring-teal-200",
    "Chronic Kidney Disease": "bg-emerald-50 text-emerald-700 ring-emerald-200",
    COPD: "bg-cyan-50 text-cyan-700 ring-cyan-200",
    Anxiety: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  };
  return tones[condition] ?? "bg-slate-100 text-slate-700 ring-slate-200";
}
