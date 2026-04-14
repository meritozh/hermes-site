import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";

const DIARY_BASE = path.join(
  process.env.HOME || "/Users/gaowanqiu",
  "Documents",
  "hermes",
  "diary"
);

const MONTH_NAMES = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

const MONTH_DISPLAY = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export interface DiaryEntry {
  date: string; // YYYY-MM-DD
  dayName: string;
  content: string; // raw markdown
  html: string; // rendered html
}

export interface DiaryMonth {
  year: number;
  month: number;
  monthName: string; // e.g. "april"
  monthDisplay: string; // e.g. "April"
  slug: string; // e.g. "04-april"
  entries: DiaryEntry[];
}

export interface DiaryYear {
  year: number;
  months: DiaryMonth[];
}

function parseEntries(markdown: string): DiaryEntry[] {
  const entries: DiaryEntry[] = [];
  // Split by H1 headings: "# YYYY-MM-DD — DayName"
  const parts = markdown.split(/^# (\d{4}-\d{2}-\d{2})\s*[—–-]\s*(.+)$/gm);

  // parts[0] is before first heading (empty or whitespace)
  // Then alternating: date, dayName + content, date, dayName + content, ...
  for (let i = 1; i < parts.length; i += 3) {
    const date = parts[i];
    const rest = parts[i + 1] || "";
    // rest starts with the day name, then newline, then content
    const lines = rest.split("\n");
    const dayName = lines[0].trim();
    const content = lines.slice(1).join("\n").trim();

    if (date && dayName) {
      entries.push({
        date,
        dayName,
        content,
        html: marked(content) as string,
      });
    }
  }

  // Sort newest first
  entries.sort((a, b) => b.date.localeCompare(a.date));
  return entries;
}

function readMonthFile(yearDir: string, fileName: string): DiaryMonth | null {
  const match = fileName.match(/^(\d{2})-(.+)\.md$/);
  if (!match) return null;

  const month = parseInt(match[1], 10);
  const monthName = match[2];

  const filePath = path.join(yearDir, fileName);
  const content = fs.readFileSync(filePath, "utf-8");
  const entries = parseEntries(content);

  return {
    year: parseInt(path.basename(yearDir), 10),
    month,
    monthName,
    monthDisplay: MONTH_DISPLAY[month - 1] || monthName,
    slug: fileName.replace(/\.md$/, ""),
    entries,
  };
}

export function getAllDiaryData(): DiaryYear[] {
  if (!fs.existsSync(DIARY_BASE)) return [];

  const years: DiaryYear[] = [];
  const yearDirs = fs
    .readdirSync(DIARY_BASE)
    .filter((d) => /^\d{4}$/.test(d))
    .sort()
    .reverse();

  for (const yearDir of yearDirs) {
    const fullPath = path.join(DIARY_BASE, yearDir);
    if (!fs.statSync(fullPath).isDirectory()) continue;

    const year = parseInt(yearDir, 10);
    const files = fs.readdirSync(fullPath).filter((f) => f.endsWith(".md"));

    const months = files
      .map((f) => readMonthFile(fullPath, f))
      .filter((m): m is DiaryMonth => m !== null)
      .sort((a, b) => b.month - a.month);

    if (months.length > 0) {
      years.push({ year, months });
    }
  }

  return years;
}

export function getMonthData(
  year: number,
  monthSlug: string
): DiaryMonth | null {
  const yearDir = path.join(DIARY_BASE, String(year));
  if (!fs.existsSync(yearDir)) return null;

  const fileName = `${monthSlug}.md`;
  const filePath = path.join(yearDir, fileName);
  if (!fs.existsSync(filePath)) return null;

  return readMonthFile(yearDir, fileName);
}

export function getAllMonthPaths(): Array<{ year: number; month: string }> {
  const data = getAllDiaryData();
  const paths: Array<{ year: number; month: string }> = [];
  for (const y of data) {
    for (const m of y.months) {
      paths.push({ year: y.year, month: m.slug });
    }
  }
  return paths;
}

export function getLatestEntries(count: number = 5): DiaryEntry[] {
  const data = getAllDiaryData();
  const all: DiaryEntry[] = [];
  for (const y of data) {
    for (const m of y.months) {
      all.push(...m.entries);
    }
  }
  all.sort((a, b) => b.date.localeCompare(a.date));
  return all.slice(0, count);
}
