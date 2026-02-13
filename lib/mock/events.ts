import mockDataRaw from "@/data/mockData.json";
import type { MatchEvent, MockData } from "@/types/mockData";

const mockData = mockDataRaw as MockData;

const sortByDateAsc = (a: MatchEvent, b: MatchEvent) => {
  const aTime = Date.parse(a.date);
  const bTime = Date.parse(b.date);
  if (Number.isFinite(aTime) && Number.isFinite(bTime)) return aTime - bTime;
  return String(a.date).localeCompare(String(b.date));
};

const sameDay = (iso: string, yyyyMmDd: string) => {
  // Compare UTC date parts to keep behavior stable across timezones
  const time = Date.parse(iso);
  if (!Number.isFinite(time)) return false;
  const d = new Date(time);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}` === yyyyMmDd;
};

export async function fetchFixturesMock(date?: string): Promise<MatchEvent[]> {
  const items = [...mockData.events].sort(sortByDateAsc);

  if (!date) return items;

  const filtered = items.filter((e) => sameDay(e.date, date));

  // If the mock dataset doesn't include that day, fall back to all items
  // so the UI stays populated during development.
  return filtered.length > 0 ? filtered : items;
}

export async function fetchLiveMatchesMock(): Promise<MatchEvent[]> {
  const items = [...mockData.events].filter((e) => e.status === "Live").sort(sortByDateAsc);
  return items;
}
