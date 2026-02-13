import MatchCenterClient from "./MatchCenterClient";

export default async function MatchCenter({
  searchParams,
}: {
  searchParams?: Promise<{ m?: string | string[] }> | { m?: string | string[] };
}) {
  const resolved = await Promise.resolve(searchParams);
  const raw = resolved?.m;
  const m = Array.isArray(raw) ? raw[0] : raw;

  return <MatchCenterClient matchId={m} />;
}
