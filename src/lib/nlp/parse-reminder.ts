/**
 * Interpretação de linguagem natural (pt-BR) para lembretes.
 *
 * Princípio fundamental do Voztrace: nunca inventar data ou horário.
 * Quando a frase não informa quando lembrar, devolvemos `missing` para que a
 * interface pergunte ao usuário em vez de assumir.
 */

import type { Recurrence } from "@/lib/reminders/types";

export interface ParsedReminder {
  title: string;
  date: string | null; // yyyy-MM-dd
  time: string | null; // HH:mm
  recurrence: Recurrence;
  weekday: number | null;
  monthday: number | null;
  missing: Array<"title" | "date" | "time">;
  originalText: string;
}

const ACCENTS: Record<string, string> = {
  á: "a",
  à: "a",
  â: "a",
  ã: "a",
  ä: "a",
  é: "e",
  è: "e",
  ê: "e",
  ë: "e",
  í: "i",
  ì: "i",
  î: "i",
  ï: "i",
  ó: "o",
  ò: "o",
  ô: "o",
  õ: "o",
  ö: "o",
  ú: "u",
  ù: "u",
  û: "u",
  ü: "u",
  ç: "c",
  ñ: "n",
};

/** Remove acentos preservando o comprimento (índices continuam válidos). */
function deaccent(value: string): string {
  let out = "";
  for (const char of value.toLowerCase()) {
    out += ACCENTS[char] ?? char;
  }
  return out;
}

const WEEKDAYS: Record<string, number> = {
  domingo: 0,
  segunda: 1,
  terca: 2,
  quarta: 3,
  quinta: 4,
  sexta: 5,
  sabado: 6,
};

const MONTHS: Record<string, number> = {
  janeiro: 0,
  fevereiro: 1,
  marco: 2,
  abril: 3,
  maio: 4,
  junho: 5,
  julho: 6,
  agosto: 7,
  setembro: 8,
  outubro: 9,
  novembro: 10,
  dezembro: 11,
};

const NUMBER_WORDS: Record<string, number> = {
  um: 1,
  uma: 1,
  dois: 2,
  duas: 2,
  tres: 3,
  quatro: 4,
  cinco: 5,
  seis: 6,
  sete: 7,
  oito: 8,
  nove: 9,
  dez: 10,
  quinze: 15,
  vinte: 20,
  trinta: 30,
};

const WEEKDAY_PATTERN = "domingo|segunda|terca|quarta|quinta|sexta|sabado";
const MONTH_PATTERN = Object.keys(MONTHS).join("|");

interface Span {
  start: number;
  end: number;
}

export function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function toDateString(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function fromDateString(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y!, (m ?? 1) - 1, d ?? 1);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function nextWeekday(from: Date, weekday: number, forceNext: boolean): Date {
  const base = startOfDay(from);
  let delta = (weekday - base.getDay() + 7) % 7;
  if (delta === 0 && forceNext) delta = 7;
  return addDays(base, delta);
}

function nextMonthday(from: Date, day: number): Date {
  const base = startOfDay(from);
  const candidate = new Date(base.getFullYear(), base.getMonth(), day);
  if (candidate.getTime() >= base.getTime()) return candidate;
  return new Date(base.getFullYear(), base.getMonth() + 1, day);
}

function amount(raw: string): number {
  const numeric = Number(raw);
  if (!Number.isNaN(numeric)) return numeric;
  return NUMBER_WORDS[raw] ?? 1;
}

function shiftPeriod(hour: number, period: string | undefined): number {
  if (!period) return hour;
  if (period.includes("tarde")) return hour < 12 ? hour + 12 : hour;
  if (period.includes("noite")) return hour < 12 ? hour + 12 : hour;
  if (period.includes("madrugada") || period.includes("manha")) {
    return hour === 12 ? 0 : hour;
  }
  return hour;
}

/**
 * Interpreta uma frase em português e devolve o rascunho do lembrete.
 * `now` permite testes determinísticos.
 */
export function parseReminder(input: string, now: Date = new Date()): ParsedReminder {
  const originalText = input.trim();
  const norm = deaccent(originalText);
  const spans: Span[] = [];

  const consume = (match: RegExpMatchArray | null): boolean => {
    if (!match || match.index === undefined) return false;
    spans.push({ start: match.index, end: match.index + match[0].length });
    return true;
  };

  let recurrence: Recurrence = "none";
  let weekday: number | null = null;
  let monthday: number | null = null;
  let date: Date | null = null;
  let hour: number | null = null;
  let minute = 0;

  // ---------- Recorrência ----------
  const monthlyMatch =
    norm.match(
      /\b(?:todo|todos\s+os|em\s+todo)\s+(?:mes(?:es)?\s+)?(?:no\s+)?dia\s+(\d{1,2})\b/,
    ) ?? norm.match(/\btodo\s+dia\s+(\d{1,2})\b/);
  const weeklyMatch = norm.match(
    new RegExp(
      `\\b(?:toda|todo|todas\\s+as|todos\\s+os)\\s+(${WEEKDAY_PATTERN})s?(?:[-\\s]feiras?)?\\b`,
    ),
  );
  const dailyMatch = norm.match(/\b(?:todo\s+dia|todos\s+os\s+dias|diariamente)\b/);
  const everyMonthMatch = norm.match(/\b(?:todo\s+mes|mensalmente)\b/);
  const everyWeekMatch = norm.match(/\b(?:toda\s+semana|semanalmente)\b/);

  if (monthlyMatch) {
    recurrence = "monthly";
    monthday = Number(monthlyMatch[1]);
    consume(monthlyMatch);
  } else if (weeklyMatch) {
    recurrence = "weekly";
    weekday = WEEKDAYS[weeklyMatch[1]!] ?? null;
    consume(weeklyMatch);
  } else if (dailyMatch) {
    recurrence = "daily";
    consume(dailyMatch);
  } else if (everyMonthMatch) {
    recurrence = "monthly";
    consume(everyMonthMatch);
  } else if (everyWeekMatch) {
    recurrence = "weekly";
    consume(everyWeekMatch);
  }

  // ---------- Horário ----------
  const periodGroup = "(?:\\s+(?:da|de|pela)\\s+(manha|tarde|noite|madrugada))?";
  const timePatterns: Array<{ re: RegExp; read: (m: RegExpMatchArray) => [number, number] }> = [
    {
      re: new RegExp(`\\b(?:as|a|para\\s+as)\\s*(\\d{1,2})\\s*[h:]\\s*(\\d{2})${periodGroup}`),
      read: (m) => [shiftPeriod(Number(m[1]), m[3]), Number(m[2])],
    },
    {
      re: new RegExp(`\\b(\\d{1,2})\\s*[h:]\\s*(\\d{2})${periodGroup}`),
      read: (m) => [shiftPeriod(Number(m[1]), m[3]), Number(m[2])],
    },
    {
      re: /\bmeio[-\s]dia\b/,
      read: () => [12, 0],
    },
    {
      re: /\bmeia[-\s]noite\b/,
      read: () => [0, 0],
    },
    {
      re: new RegExp(`\\b(\\d{1,2})\\s*(?:h|hs|horas?)\\b${periodGroup}`),
      read: (m) => [shiftPeriod(Number(m[1]), m[2]), 0],
    },
    {
      re: new RegExp(`\\b(?:as|para\\s+as)\\s+(\\d{1,2})\\b${periodGroup}`),
      read: (m) => [shiftPeriod(Number(m[1]), m[2]), 0],
    },
  ];

  for (const pattern of timePatterns) {
    const match = norm.match(pattern.re);
    if (!match) continue;
    const [h, m] = pattern.read(match);
    if (h > 23 || m > 59) continue;
    hour = h;
    minute = m;
    consume(match);
    break;
  }

  // ---------- Data ----------
  const relativeIn = norm.match(
    /\bdaqui\s+a\s+(\d+|um|uma|dois|duas|tres|quatro|cinco|seis|sete|oito|nove|dez|quinze|vinte|trinta)\s+(minutos?|horas?|dias?|semanas?|mes(?:es)?)\b/,
  );
  const dayMonthWord = norm.match(new RegExp(`\\b(?:dia\\s+)?(\\d{1,2})\\s+de\\s+(${MONTH_PATTERN})(?:\\s+de\\s+(\\d{4}))?\\b`));
  const numericDate = norm.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
  const nextWeekdayMatch = norm.match(
    new RegExp(
      `\\b(?:(?:na|no)\\s+)?(?:proxima|proximo)\\s+(${WEEKDAY_PATTERN})(?:[-\\s]feira)?\\b|\\b(${WEEKDAY_PATTERN})(?:[-\\s]feira)?\\s+que\\s+vem\\b`,
    ),
  );
  const bareWeekday = norm.match(
    new RegExp(`\\b(?:na|no)\\s+(${WEEKDAY_PATTERN})(?:[-\\s]feira)?\\b`),
  );
  const nextWeek = norm.match(/\b(?:proxima\s+semana|semana\s+que\s+vem)\b/);
  const nextMonth = norm.match(/\b(?:proximo\s+mes|mes\s+que\s+vem)\b/);
  const dayOfMonth = norm.match(/\bdia\s+(\d{1,2})\b/);
  const afterTomorrow = norm.match(/\bdepois\s+de\s+amanha\b/);
  const tomorrow = norm.match(/\bamanha\b/);
  const today = norm.match(/\bhoje\b/);

  if (relativeIn) {
    const qty = amount(relativeIn[1]!);
    const unit = relativeIn[2]!;
    if (unit.startsWith("minuto")) {
      const target = new Date(now.getTime() + qty * 60_000);
      date = startOfDay(target);
      if (hour === null) {
        hour = target.getHours();
        minute = target.getMinutes();
      }
    } else if (unit.startsWith("hora")) {
      const target = new Date(now.getTime() + qty * 3_600_000);
      date = startOfDay(target);
      if (hour === null) {
        hour = target.getHours();
        minute = target.getMinutes();
      }
    } else if (unit.startsWith("dia")) {
      date = addDays(startOfDay(now), qty);
    } else if (unit.startsWith("semana")) {
      date = addDays(startOfDay(now), qty * 7);
    } else {
      const target = startOfDay(now);
      target.setMonth(target.getMonth() + qty);
      date = target;
    }
    consume(relativeIn);
  } else if (afterTomorrow) {
    date = addDays(startOfDay(now), 2);
    consume(afterTomorrow);
  } else if (tomorrow) {
    date = addDays(startOfDay(now), 1);
    consume(tomorrow);
  } else if (today) {
    date = startOfDay(now);
    consume(today);
  } else if (dayMonthWord) {
    const day = Number(dayMonthWord[1]);
    const month = MONTHS[dayMonthWord[2]!]!;
    const year = dayMonthWord[3] ? Number(dayMonthWord[3]) : now.getFullYear();
    let candidate = new Date(year, month, day);
    if (!dayMonthWord[3] && candidate.getTime() < startOfDay(now).getTime()) {
      candidate = new Date(year + 1, month, day);
    }
    date = candidate;
    consume(dayMonthWord);
  } else if (numericDate) {
    const day = Number(numericDate[1]);
    const month = Number(numericDate[2]) - 1;
    let year = numericDate[3] ? Number(numericDate[3]) : now.getFullYear();
    if (year < 100) year += 2000;
    let candidate = new Date(year, month, day);
    if (!numericDate[3] && candidate.getTime() < startOfDay(now).getTime()) {
      candidate = new Date(year + 1, month, day);
    }
    date = candidate;
    consume(numericDate);
  } else if (nextWeekdayMatch) {
    const name = nextWeekdayMatch[1] ?? nextWeekdayMatch[2]!;
    date = nextWeekday(now, WEEKDAYS[name]!, true);
    consume(nextWeekdayMatch);
  } else if (nextWeek) {
    date = addDays(startOfDay(now), 7);
    consume(nextWeek);
  } else if (nextMonth) {
    const target = startOfDay(now);
    target.setMonth(target.getMonth() + 1);
    date = target;
    consume(nextMonth);
  } else if (bareWeekday) {
    date = nextWeekday(now, WEEKDAYS[bareWeekday[1]!]!, false);
    consume(bareWeekday);
  } else if (dayOfMonth) {
    date = nextMonthday(now, Number(dayOfMonth[1]));
    consume(dayOfMonth);
  }

  // Datas derivadas da recorrência (primeira ocorrência), nunca inventadas.
  if (!date) {
    if (recurrence === "weekly" && weekday !== null) {
      date = nextWeekday(now, weekday, false);
    } else if (recurrence === "monthly" && monthday !== null) {
      date = nextMonthday(now, monthday);
    } else if (recurrence === "daily") {
      date = startOfDay(now);
    }
  }

  if (recurrence === "weekly" && weekday === null && date) weekday = date.getDay();
  if (recurrence === "monthly" && monthday === null && date) monthday = date.getDate();

  // Se a recorrência diária já passou hoje, a primeira ocorrência é amanhã.
  if (recurrence === "daily" && hour !== null && date) {
    const at = new Date(date);
    at.setHours(hour, minute, 0, 0);
    if (at.getTime() < now.getTime()) date = addDays(date, 1);
  }

  // ---------- Título ----------
  let title = removeSpans(originalText, spans);
  title = cleanupTitle(title);

  const missing: ParsedReminder["missing"] = [];
  if (!title) missing.push("title");
  if (!date) missing.push("date");
  if (hour === null) missing.push("time");

  return {
    title,
    date: date ? toDateString(date) : null,
    time: hour === null ? null : `${pad2(hour)}:${pad2(minute)}`,
    recurrence,
    weekday,
    monthday,
    missing,
    originalText,
  };
}

function removeSpans(text: string, spans: Span[]): string {
  if (spans.length === 0) return text;
  const sorted = [...spans].sort((a, b) => a.start - b.start);
  let out = "";
  let cursor = 0;
  for (const span of sorted) {
    if (span.start < cursor) continue;
    out += text.slice(cursor, span.start) + " ";
    cursor = span.end;
  }
  out += text.slice(cursor);
  return out;
}

const LEADING_NOISE = [
  /^\s*(?:por\s+favor|pf)\b[,\s]*/i,
  /^\s*(?:voztrace)\b[,\s]*/i,
  /^\s*(?:nao\s+me\s+deixe\s+esquecer|não\s+me\s+deixe\s+esquecer)\b[,\s]*/i,
  /^\s*(?:me\s+)?lembr(?:a|e|ar|e-me|a-me)\b[,\s]*/i,
  /^\s*(?:de|do|da|que|para|pra|pro)\b\s+/i,
  /^\s*(?:eu\s+)?(?:preciso|tenho\s+que|quero)\b\s+(?:de\s+)?/i,
];

function cleanupTitle(raw: string): string {
  let title = raw.replace(/\s+/g, " ").trim();
  let changed = true;
  while (changed) {
    changed = false;
    for (const pattern of LEADING_NOISE) {
      const next = title.replace(pattern, "");
      if (next !== title) {
        title = next.trim();
        changed = true;
      }
    }
  }
  title = title.replace(/^[,;.\-–—\s]+/, "").replace(/[,;.\s]+$/, "");
  title = title.replace(/\s+/g, " ").trim();
  if (!title) return "";
  return title.charAt(0).toUpperCase() + title.slice(1);
}
