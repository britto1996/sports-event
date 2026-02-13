"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { useMemo } from "react";
import type { MatchEvent } from "@/types/mockData";
import { buildPlayersForMatch } from "@/components/three/playerSim";

function Pitch() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[10, 7]} />
        <meshStandardMaterial color="#f7f7f7" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[1.35, 1.42, 80]} />
        <meshStandardMaterial color="#d9d9d9" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.011, 2.9]}>
        <circleGeometry args={[0.65, 40]} />
        <meshStandardMaterial color="#eaeaea" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.011, -2.9]}>
        <circleGeometry args={[0.65, 40]} />
        <meshStandardMaterial color="#eaeaea" />
      </mesh>
    </group>
  );
}

function PlayerToken({
  x,
  z,
  color,
  label,
}: {
  x: number;
  z: number;
  color: string;
  label: string;
}) {
  return (
    <group position={[x, 0.12, z]}>
      <mesh>
        <cylinderGeometry args={[0.16, 0.16, 0.12, 20]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
      <Text
        position={[0, 0.18, 0]}
        fontSize={0.16}
        color="#222"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

function StatBoard({ match }: { match: MatchEvent }) {
  const minute = match.minute ?? "";
  const scoreHome = match.homeTeam.score ?? 0;
  const scoreAway = match.awayTeam.score ?? 0;
  const possHome = match.possession?.home;
  const possAway = match.possession?.away;
  const shotsHome = match.shots?.home;
  const shotsAway = match.shots?.away;

  const lines = [
    `${match.homeTeam.name}  ${scoreHome} - ${scoreAway}  ${match.awayTeam.name}`,
    minute ? `Minute: ${minute}` : "Live",
    possHome != null && possAway != null ? `Possession: ${possHome}% / ${possAway}%` : "",
    shotsHome != null && shotsAway != null ? `Shots: ${shotsHome} / ${shotsAway}` : "",
  ].filter(Boolean);

  return (
    <group position={[0, 1.9, 0]}>
      <mesh position={[0, 0, -3.9]}>
        <boxGeometry args={[9.4, 1.2, 0.1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {lines.map((line, i) => (
        <Text
          key={line}
          position={[0, 0.33 - i * 0.3, -3.84]}
          fontSize={0.22}
          color="#222"
          anchorX="center"
          anchorY="middle"
        >
          {line}
        </Text>
      ))}
    </group>
  );
}

export default function LiveMatch3DView({ match }: { match: MatchEvent }) {
  const players = useMemo(() => buildPlayersForMatch(match), [match]);

  return (
    <div
      style={{
        width: "100%",
        height: 560,
        borderRadius: 18,
        overflow: "hidden",
        border: "1px solid var(--border-subtle)",
        background: "var(--surface-1)",
      }}
    >
      <Canvas camera={{ position: [0, 6.2, 12.5], fov: 45, near: 0.1, far: 100 }}>
        <ambientLight intensity={0.85} />
        <directionalLight position={[10, 10, 7]} intensity={1.1} />
        <Pitch />
        <StatBoard match={match} />

        {/* Home */}
        {players.home.map((p) => (
          <PlayerToken
            key={p.id}
            x={p.coord.x}
            z={p.coord.z}
            color="#ff385c"
            label={String(p.number)}
          />
        ))}

        {/* Away */}
        {players.away.map((p) => (
          <PlayerToken
            key={p.id}
            x={p.coord.x}
            z={p.coord.z}
            color="#222222"
            label={String(p.number)}
          />
        ))}

        {/* Top player stats (3D) */}
        <group position={[-4.4, 0.4, -2.6]}>
          <Text fontSize={0.22} color="#222" anchorX="left" anchorY="middle">
            Top players
          </Text>
          {[
            ...players.home.slice(0, 2).map((p) => ({ ...p, side: "home" as const })),
            ...players.away.slice(0, 1).map((p) => ({ ...p, side: "away" as const })),
          ].map((p, idx) => (
            <Text
              key={p.id}
              position={[0, -0.3 - idx * 0.28, 0]}
              fontSize={0.18}
              color={p.side === "home" ? "#ff385c" : "#222"}
              anchorX="left"
              anchorY="middle"
            >
              {`${p.name}  •  ${p.stats.rating}  •  G${p.stats.goals} A${p.stats.assists}`}
            </Text>
          ))}
        </group>

        <OrbitControls enablePan={false} minDistance={9} maxDistance={20} maxPolarAngle={Math.PI / 2.05} />
      </Canvas>
    </div>
  );
}
