import TicketsClient from "./TicketsClient";

export default function TicketsPage({
  searchParams,
}: {
  searchParams?: { t?: string };
}) {
  const t = searchParams?.t;
  return <TicketsClient eventId={t} />;
}
