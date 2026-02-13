"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { useMemo, useState } from "react";
import type { MatchEvent } from "@/types/mockData";
import { buildPlayersForMatch } from "@/components/three/playerSim";

function formatWhen(iso: string) {
  const time = Date.parse(iso);
  if (!Number.isFinite(time)) return iso;
  return new Date(time).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

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
    </group>
  );
}

function PlayerToken({ x, z, color }: { x: number; z: number; color: string }) {
  return (
    <mesh position={[x, 0.12, z]}>
      <sphereGeometry args={[0.15, 18, 18]} />
      <meshStandardMaterial color={color} roughness={0.55} />
    </mesh>
  );
}

function MatchPanel({
  event,
  active,
  x,
  onClick,
}: {
  event: MatchEvent;
  active: boolean;
  x: number;
  onClick: () => void;
}) {
  return (
    <group position={[x, 0.85, 3.55]} onClick={onClick}>
      <mesh>
        <boxGeometry args={[2.85, 1.1, 0.08]} />
        <meshStandardMaterial color={active ? "#ffffff" : "#f7f7f7"} />
      </mesh>

      <Text
        position={[-1.3, 0.25, 0.06]}
        fontSize={0.17}
        color={active ? "#222" : "#555"}
        anchorX="left"
        anchorY="middle"
        maxWidth={2.5}
      >
        {event.title}
      </Text>
      <Text
        position={[-1.3, -0.1, 0.06]}
        fontSize={0.14}
        color={active ? "#ff385c" : "#717171"}
        anchorX="left"
        anchorY="middle"
        maxWidth={2.5}
      >
        {`${event.status} • ${formatWhen(event.date)}`}
      </Text>
      <Text
        position={[-1.3, -0.38, 0.06]}
        fontSize={0.13}
        color={"#717171"}
        anchorX="left"
        anchorY="middle"
        maxWidth={2.5}
      >
        {event.venue}
      </Text>
    </group>
  );
}

export default function Fixtures3DView({ events }: { events: MatchEvent[] }) {
  const safe = events ?? [];
  const [selectedId, setSelectedId] = useState<string | null>(safe[0]?.id ?? null);

  const selected = useMemo(
    () => safe.find((e) => e.id === selectedId) ?? safe[0],
    [safe, selectedId]
  );

  const players = useMemo(() => {
    if (!selected) return null;
    return buildPlayersForMatch(selected);
  }, [selected]);

  const topPlayers = useMemo(() => {
    if (!players) return [];
    const all = [...players.home, ...players.away];
    return [...all].sort((a, b) => b.stats.rating - a.stats.rating).slice(0, 5);
  }, [players]);

  if (!selected || safe.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          padding: "2.5rem",
          borderRadius: 18,
          border: "1px solid var(--border-subtle)",
          background: "var(--surface-2)",
          color: "var(--muted)",
          fontWeight: 650,
          textAlign: "center",
        }}
      >
        No fixtures available.
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: 640,
        borderRadius: 18,
        overflow: "hidden",
        border: "1px solid var(--border-subtle)",
        background: "var(--surface-1)",
      }}
    >
      <Canvas camera={{ position: [0, 6.4, 13], fov: 45, near: 0.1, far: 120 }}>
        <ambientLight intensity={0.85} />
        <directionalLight position={[10, 10, 7]} intensity={1.1} />

        <Pitch />

        {/* Current match header (3D) */}
        <group position={[0, 2.15, 0]}>
          <Text fontSize={0.28} color="#222" anchorX="center" anchorY="middle">
            {selected.title}
          </Text>
          <Text position={[0, -0.35, 0]} fontSize={0.18} color="#717171" anchorX="center" anchorY="middle">
            {`${selected.status} • ${formatWhen(selected.date)} • ${selected.venue}`}
          </Text>
        </group>

        {/* Players */}
        {players?.home.map((p) => (
          <PlayerToken key={p.id} x={p.coord.x} z={p.coord.z} color="#ff385c" />
        ))}
        {players?.away.map((p) => (
          <PlayerToken key={p.id} x={p.coord.x} z={p.coord.z} color="#222222" />
        ))}

        {/* Player stats list (3D) */}
        <group position={[-4.55, 0.55, -2.6]}>
          <Text fontSize={0.22} color="#222" anchorX="left" anchorY="middle">
            Player stats
          </Text>
          {topPlayers.map((p, idx) => (
            <Text
              key={p.id}
              position={[0, -0.3 - idx * 0.28, 0]}
              fontSize={0.18}
              color={p.id.startsWith("home") ? "#ff385c" : "#222"}
              anchorX="left"
              anchorY="middle"
              maxWidth={4.4}
            >
              {`${p.name} (#${p.number})  •  ${p.position}  •  ${p.stats.rating}  •  G${p.stats.goals} A${p.stats.assists}  •  S${p.stats.shots}`}
            </Text>
          ))}
        </group>

        {/* Match panels (3D list) */}
        {safe.slice(0, 5).map((event, idx) => {
          const x = -6.2 + idx * 3.1;
          return (
            <MatchPanel
              key={event.id}
              event={event}
              active={event.id === selected.id}
              x={x}
              onClick={() => setSelectedId(event.id)}
            />
          );
        })}

        <OrbitControls enablePan={false} minDistance={9} maxDistance={24} maxPolarAngle={Math.PI / 2.05} />
      </Canvas>
    </div>
  );
}
