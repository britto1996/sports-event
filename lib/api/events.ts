import { apiClient, getApiErrorMessage } from "@/lib/api/client";
import type { MatchEvent, MatchStatus, Team } from "@/types/mockData";

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord | null => {
  if (!value || typeof value !== "object") return null;
  return value as UnknownRecord;
};

const asString = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value : null;

const asNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

const normalizeStatus = (value: unknown): MatchStatus => {
  const raw = asString(value)?.toLowerCase();
  if (!raw) return "Upcoming";
  if (raw === "live" || raw === "in_progress" || raw === "in-progress") return "Live";
  if (
    raw === "finished" ||
    raw === "final" ||
    raw === "completed" ||
    raw === "ft" ||
    raw === "full_time" ||
    raw === "full-time"
  )
    return "Finished";
  if (raw === "upcoming" || raw === "scheduled" || raw === "pending") return "Upcoming";
  return "Upcoming";
};

const normalizeTeam = (value: unknown, fallbackName: string): Team => {
  const obj = asRecord(value);
  const name = asString(obj?.name) ?? asString(obj?.teamName) ?? fallbackName;
  const logo =
    asString(obj?.logo) ??
    asString(obj?.crest) ??
    asString(obj?.badge) ??
    asString(obj?.image) ??
    "";

  const score =
    asNumber(obj?.score) ??
    asNumber(obj?.goals) ??
    asNumber(obj?.points) ??
    undefined;

  return {
    name,
    logo,
    ...(typeof score === "number" ? { score } : {}),
  };
};

const extractArray = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) return payload;

  const obj = asRecord(payload);
  if (!obj) return [];

  const candidates = [
    obj.fixtures,
    obj.events,
    obj.matches,
    obj.results,
    obj.response,
    obj.data,
    obj.items,
  ];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
    const inner = asRecord(candidate);
    if (inner) {
      const innerCandidates = [
        inner.fixtures,
        inner.events,
        inner.matches,
        inner.results,
        inner.response,
        inner.data,
        inner.items,
      ];
      for (const innerCandidate of innerCandidates) {
        if (Array.isArray(innerCandidate)) return innerCandidate;
      }
    }
  }

  return [];
};

const formatUtcDate = (d: Date) => d.toISOString().slice(0, 10);

const defaultFixturesDate = () => {
  const configured = process.env.NEXT_PUBLIC_FIXTURES_DATE;
  if (configured && configured.trim()) return configured.trim();
  return formatUtcDate(new Date());
};

const normalizeEvent = (value: unknown, index: number): MatchEvent | null => {
  const obj = asRecord(value);
  if (!obj) return null;

  const fixture = asRecord(obj.fixture);
  const league = asRecord(obj.league);
  const teams = asRecord(obj.teams);
  const goals = asRecord(obj.goals);
  const scoreBlock = asRecord(obj.score);
  const stats = asRecord(obj.statistics) ?? asRecord(obj.stats);

  const id =
    asString(fixture?.id) ??
    asString(obj.id) ??
    asString(obj._id) ??
    asString(obj.matchId) ??
    asString(obj.eventId) ??
    `event-${index}`;

  const title =
    asString(obj.title) ??
    asString(obj.name) ??
    asString(obj.matchTitle) ??
    `${asString(asRecord(teams?.home)?.name) ??
    asString(obj.homeTeam) ??
    asString(obj.homeTeamName) ??
    "Home"
    } vs ${asString(asRecord(teams?.away)?.name) ??
    asString(obj.awayTeam) ??
    asString(obj.awayTeamName) ??
    "Away"
    }`;

  const competition =
    asString(obj.competition) ??
    asString(obj.league) ??
    asString(obj.tournament) ??
    asString(obj.competitionName) ??
    asString(league?.name) ??
    undefined;

  const date =
    asString(fixture?.date) ??
    asString(obj.date) ??
    asString(obj.kickoff) ??
    asString(obj.startTime) ??
    asString(obj.start_time) ??
    new Date().toISOString();

  const venue =
    asString(asRecord(fixture?.venue)?.name) ??
    asString(obj.venue) ??
    asString(obj.stadium) ??
    asString(obj.location) ??
    "";

  const status = normalizeStatus(
    asRecord(fixture?.status)?.short ??
    asRecord(fixture?.status)?.long ??
    obj.status ??
    obj.state ??
    obj.matchStatus
  );

  const elapsed = asNumber(asRecord(fixture?.status)?.elapsed);
  const minuteFromFixture = typeof elapsed === "number" ? `${elapsed}'` : null;
  const minute = asString(obj.minute ?? obj.time ?? obj.clock) ?? minuteFromFixture ?? undefined;

  const possessionHome =
    asNumber(asRecord(obj.possession)?.home) ??
    asNumber(asRecord(stats?.possession)?.home) ??
    asNumber(asRecord(stats?.possession)?.homeTeam);
  const possessionAway =
    asNumber(asRecord(obj.possession)?.away) ??
    asNumber(asRecord(stats?.possession)?.away) ??
    asNumber(asRecord(stats?.possession)?.awayTeam);

  const shotsHome =
    asNumber(asRecord(obj.shots)?.home) ??
    asNumber(asRecord(stats?.shots)?.home) ??
    asNumber(asRecord(stats?.shotsOnTarget)?.home) ??
    asNumber(asRecord(stats?.shots_on_target)?.home);
  const shotsAway =
    asNumber(asRecord(obj.shots)?.away) ??
    asNumber(asRecord(stats?.shots)?.away) ??
    asNumber(asRecord(stats?.shotsOnTarget)?.away) ??
    asNumber(asRecord(stats?.shots_on_target)?.away);

  const homeTeam = normalizeTeam(
    teams?.home ?? obj.homeTeam ?? obj.home ?? obj.home_team,
    asString(asRecord(teams?.home)?.name) ?? asString(obj.homeTeamName) ?? "Home"
  );

  const awayTeam = normalizeTeam(
    teams?.away ?? obj.awayTeam ?? obj.away ?? obj.away_team,
    asString(asRecord(teams?.away)?.name) ?? asString(obj.awayTeamName) ?? "Away"
  );

  const homeScore =
    asNumber(goals?.home) ??
    asNumber(obj.homeScore) ??
    asNumber(scoreBlock?.home) ??
    asNumber(asRecord(obj.scores)?.home) ??
    asNumber(asRecord(obj.result)?.home);

  const awayScore =
    asNumber(goals?.away) ??
    asNumber(obj.awayScore) ??
    asNumber(scoreBlock?.away) ??
    asNumber(asRecord(obj.scores)?.away) ??
    asNumber(asRecord(obj.result)?.away);

  const mergedHomeTeam: Team =
    typeof homeScore === "number" ? { ...homeTeam, score: homeScore } : homeTeam;
  const mergedAwayTeam: Team =
    typeof awayScore === "number" ? { ...awayTeam, score: awayScore } : awayTeam;

  return {
    id,
    title,
    competition,
    date,
    venue,
    status,
    homeTeam: mergedHomeTeam,
    awayTeam: mergedAwayTeam,
    ...(minute ? { minute } : {}),
    ...(typeof possessionHome === "number" && typeof possessionAway === "number"
      ? { possession: { home: possessionHome, away: possessionAway } }
      : {}),
    ...(typeof shotsHome === "number" && typeof shotsAway === "number"
      ? { shots: { home: shotsHome, away: shotsAway } }
      : {}),
  };
};

const fetchFromPath = async (
  path: string,
  params?: Record<string, string>
): Promise<MatchEvent[]> => {
  const res = await apiClient.get(path, params ? { params } : undefined);
  const list = extractArray(res.data);
  const normalized = list
    .map((item, i) => normalizeEvent(item, i))
    .filter((e): e is MatchEvent => Boolean(e));
  return normalized;
};

export const fetchFixtures = async (date?: string): Promise<MatchEvent[]> => {
  const path = (process.env.NEXT_PUBLIC_FIXTURES_PATH?.trim() || "/fixtures").trim();
  const primaryDate = date && date.trim() ? date.trim() : defaultFixturesDate();
  const datesToTry = [primaryDate];

  // If the requested date has no fixtures, try the previous UTC day.
  const parsed = new Date(primaryDate);
  if (Number.isFinite(parsed.getTime())) {
    const yesterday = new Date(parsed);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yKey = formatUtcDate(yesterday);
    if (yKey !== primaryDate) datesToTry.push(yKey);
  }

  let lastError: unknown = null;
  for (const dKey of datesToTry) {
    try {
      const fixtures = await fetchFromPath(path, { date: dKey });
      if (fixtures.length) return fixtures;
    } catch (e) {
      lastError = e;
    }
  }

  throw new Error(getApiErrorMessage(lastError ?? new Error("No fixtures returned from API")));
};

export const fetchLiveMatches = async (): Promise<MatchEvent[]> => {
  const path = (process.env.NEXT_PUBLIC_LIVE_MATCHES_PATH?.trim() || "/matches/live").trim();

  try {
    return await fetchFromPath(path);
  } catch (e) {
    throw new Error(getApiErrorMessage(e));
  }
};

export const fetchMatchEvents = async (): Promise<MatchEvent[]> => {
  // Prefer fixtures API when available.
  try {
    const fixtures = await fetchFixtures();
    if (fixtures.length) return fixtures;
  } catch {
    // Fall back to legacy endpoints below.
  }

  const configuredPath = process.env.NEXT_PUBLIC_EVENTS_PATH;
  const primary = configuredPath && configuredPath.trim() ? configuredPath.trim() : "/events";
  const fallbacks = primary === "/events" ? ["/matches"] : ["/events", "/matches"].filter((p) => p !== primary);

  try {
    const events = await fetchFromPath(primary);
    if (events.length) return events;
  } catch {
    // Fall through to fallback endpoints.
  }

  for (const fallback of fallbacks) {
    try {
      const events = await fetchFromPath(fallback);
      if (events.length) return events;
    } catch {
      // Keep trying.
    }
  }

  throw new Error(getApiErrorMessage(new Error("No events returned from API")));
};


/**
 * Sync events from external source
 * POST /events/sync
 */
export const syncEvents = async (): Promise<MatchEvent[]> => {
  const url = `http://localhost:8000/api/events/sync`;

  try {
    // Get current date in YYYY-MM-DD format (UTC)
    const currentDate = new Date().toISOString().split('T')[0];

    console.log('[syncEvents] Calling API:', url);
    console.log('[syncEvents] Payload:', { date: currentDate });

    // Use axios directly to bypass apiClient's base URL configuration
    const axios = (await import('axios')).default;

    const res = await axios.post(url, {
      date: currentDate
    }, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const list = extractArray(res.data);
    const normalized = list
      .map((item, i) => normalizeEvent(item, i))
      .filter((e): e is MatchEvent => Boolean(e));

    return normalized;
  } catch (e) {
    if ((e as any)?.response) {
      console.error('[syncEvents] Response error:', {
        status: (e as any).response.status,
        data: (e as any).response.data,
      });
    }

    const errorMessage = getApiErrorMessage(e);
    console.error('[syncEvents] Error message:', errorMessage);
    throw new Error(errorMessage);
  }
};


/**
 * Fetch events from the server with optional limit
 * GET /events?limit=X
 */
export const fetchEvents = async (limit?: number): Promise<MatchEvent[]> => {
  const url = `http://localhost:8000/api/events${limit ? `?limit=${limit}` : ''}`;

  try {
    console.log('[fetchEvents] Calling API:', url);

    const axios = (await import('axios')).default;
    const res = await axios.get(url, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('[fetchEvents] Response status:', res.status);
    console.log('[fetchEvents] Response data:', res.data);

    const list = extractArray(res.data);
    console.log('[fetchEvents] Extracted array length:', list.length);

    const normalized = list
      .map((item, i) => normalizeEvent(item, i))
      .filter((e): e is MatchEvent => Boolean(e));

    console.log('[fetchEvents] Normalized events:', normalized.length);

    return normalized;
  } catch (e) {
    console.error('[fetchEvents] Error occurred:', e);

    if ((e as any)?.response) {
      console.error('[fetchEvents] Response error:', {
        status: (e as any).response.status,
        data: (e as any).response.data,
      });
    }

    const errorMessage = getApiErrorMessage(e);
    console.error('[fetchEvents] Error message:', errorMessage);
    throw new Error(errorMessage);
  }
};

export const getEventById = async (id: string): Promise<MatchEvent | null> => {
  try {
    const axios = (await import('axios')).default;
    const res = await axios.get(`http://localhost:8000/api/events/${id}`);
    return normalizeEvent(res.data, 0);
  } catch (e) {
    console.error("Failed to fetch event by ID", e);
    return null;
  }
};
