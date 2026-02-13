import MatchCenterClient from "./MatchCenterClient";

export default function MatchCenter({
  searchParams,
}: {
  searchParams?: { m?: string };
}) {
  const m = searchParams?.m;

    return (
      <MatchCenterClient matchId={m} />
    );
}
