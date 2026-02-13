import TicketsClient from "./TicketsClient";

export default async function TicketsPage({
  searchParams,
}: {
  searchParams?: Promise<{ t?: string | string[] }> | { t?: string | string[] };
}) {
  const resolved = await Promise.resolve(searchParams);
  const raw = resolved?.t;
  const t = Array.isArray(raw) ? raw[0] : raw;
  return <TicketsClient eventId={t} />;
}
