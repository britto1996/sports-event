import MatchCenterClient from "./MatchCenterClient";
import EventsGridClient from "./EventsGridClient";

export default async function MatchCenter({
  searchParams,
}: {
  searchParams?: Promise<{ m?: string | string[] }> | { m?: string | string[] };
}) {
  const resolved = await Promise.resolve(searchParams);
  const raw = resolved?.m;
  const m = Array.isArray(raw) ? raw[0] : raw;

  // If no matchId, show events grid
  if (!m) {
    return <EventsGridClient />;
  }

  return <MatchCenterClient matchId={m} />;
}
