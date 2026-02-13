import type { MatchEvent } from "@/types/mockData";

export type SimPlayer = {
  id: string;
  name: string;
  number: number;
  position: "GK" | "DF" | "MF" | "FW";
  stats: {
    rating: number;
    goals: number;
    assists: number;
    shots: number;
    passes: number;
  };
};

const hashString = (input: string) => {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const makeName = (seed: number) => {
  const first = [
    "Alex",
    "Kai",
    "Noah",
    "Leo",
    "Omar",
    "Mason",
    "Eli",
    "Hugo",
    "Liam",
    "Jude",
    "Ivan",
    "Rayan",
  ];
  const last = [
    "Silva",
    "Rossi",
    "Khan",
    "Diaz",
    "Martin",
    "Novak",
    "Sato",
    "Costa",
    "Ibrahim",
    "Fernandez",
    "Alvarez",
    "Kim",
  ];
  return `${first[seed % first.length]} ${last[(seed >>> 8) % last.length]}`;
};

const formationSlots = (side: "home" | "away") => {
  // Simple 4-3-3 style layout.
  // Coordinates are in pitch-space: x (left/right), z (up/down pitch).
  // Home attacks toward negative z, away toward positive z.
  const dir = side === "home" ? -1 : 1;
  return [
    { pos: "GK" as const, x: 0, z: 2.55 * dir },

    { pos: "DF" as const, x: -1.8, z: 1.4 * dir },
    { pos: "DF" as const, x: -0.6, z: 1.6 * dir },
    { pos: "DF" as const, x: 0.6, z: 1.6 * dir },
    { pos: "DF" as const, x: 1.8, z: 1.4 * dir },

    { pos: "MF" as const, x: -1.2, z: 0.4 * dir },
    { pos: "MF" as const, x: 0, z: 0.25 * dir },
    { pos: "MF" as const, x: 1.2, z: 0.4 * dir },

    { pos: "FW" as const, x: -1.4, z: -0.8 * dir },
    { pos: "FW" as const, x: 0, z: -1.05 * dir },
    { pos: "FW" as const, x: 1.4, z: -0.8 * dir },
  ];
};

export function buildPlayersForMatch(event: MatchEvent) {
  const homeSeed = hashString(`${event.id}:${event.homeTeam.name}`);
  const awaySeed = hashString(`${event.id}:${event.awayTeam.name}`);

  const home = formationSlots("home").map((slot, idx) => {
    const seed = homeSeed ^ (idx * 2654435761);
    const rating = clamp(6.2 + ((seed % 1000) / 1000) * 2.6, 6.0, 9.8);
    const goals = (seed % 17) === 0 ? 1 : 0;
    const assists = (seed % 23) === 0 ? 1 : 0;
    const shots = clamp((seed >>> 3) % 5, 0, 4);
    const passes = clamp(18 + ((seed >>> 5) % 45), 15, 70);

    return {
      id: `home-${idx}`,
      name: makeName(seed),
      number: (idx === 0 ? 1 : 2 + ((seed >>> 9) % 29)),
      position: slot.pos,
      stats: {
        rating: Number(rating.toFixed(1)),
        goals,
        assists,
        shots,
        passes,
      },
      coord: { x: slot.x, z: slot.z },
    };
  });

  const away = formationSlots("away").map((slot, idx) => {
    const seed = awaySeed ^ (idx * 2654435761);
    const rating = clamp(6.2 + ((seed % 1000) / 1000) * 2.6, 6.0, 9.8);
    const goals = (seed % 19) === 0 ? 1 : 0;
    const assists = (seed % 29) === 0 ? 1 : 0;
    const shots = clamp((seed >>> 3) % 5, 0, 4);
    const passes = clamp(18 + ((seed >>> 5) % 45), 15, 70);

    return {
      id: `away-${idx}`,
      name: makeName(seed),
      number: (idx === 0 ? 1 : 2 + ((seed >>> 9) % 29)),
      position: slot.pos,
      stats: {
        rating: Number(rating.toFixed(1)),
        goals,
        assists,
        shots,
        passes,
      },
      coord: { x: slot.x, z: slot.z },
    };
  });

  return { home, away };
}
