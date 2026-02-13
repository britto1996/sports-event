"use client";

import React, { useMemo, useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {

    Text,
    Float,
    OrbitControls,
    Environment,
    PerspectiveCamera,
    Stars,
    Sparkles,
    Html,
    Image
} from "@react-three/drei";
import * as THREE from "three";
import { easing } from "maath";

const THEME = {
    accent: "#ff385c",
    foreground: "#ffffff",
    textSecondary: "#cccccc",
    cardBg: "#1a1a1a",
};

interface PlayerData {
    id: number;
    name: string;
    role: string;
    stats: { label: string; value: string }[];
    image: string;
}

const PLAYERS: PlayerData[] = [
    {
        id: 1,
        name: "Alex 'The Flash' Rivera",
        role: "Forward",
        stats: [
            { label: "SPD", value: "98" },
            { label: "SHT", value: "92" },
            { label: "PAS", value: "88" },
        ],
        image:
            "https://images.unsplash.com/photo-1560250097-9b93dbddb426?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    },
    {
        id: 2,
        name: "Marcus 'Wall' Stone",
        role: "Defender",
        stats: [
            { label: "DEF", value: "96" },
            { label: "PHY", value: "94" },
            { label: "PAC", value: "85" },
        ],
        image:
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    },
    {
        id: 3,
        name: "Leo 'Maestro' Rossi",
        role: "Midfielder",
        stats: [
            { label: "DRI", value: "95" },
            { label: "PAS", value: "97" },
            { label: "VIS", value: "99" },
        ],
        image:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    },
];

class TextureErrorBoundary extends React.Component<{ fallback: React.ReactNode, children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: { fallback: React.ReactNode, children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: any) {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }
        return this.props.children;
    }
}

function PlayerAvatarContent({ url }: { url: string }) {
    // const texture = useTexture(url); // useTexture might be problematic with some CDNs in R3F

    // Using Drei's Image component which is more robust for simple planes
    return (
        <Image
            url={url}
            position={[0, 0.8, 0.06]}
            scale={[2.6, 2.6]}
            transparent
            opacity={1}
        />
    );
}

function PlayerAvatarFallback() {
    return (
        <mesh position={[0, 0.8, 0.06]}>
            <planeGeometry args={[2.6, 2.6]} />
            <meshStandardMaterial color="#333" />
            <Html position={[0, 0, 0.1]} transform>
                <div style={{ color: 'white', fontSize: '2em', fontWeight: 'bold' }}>?</div>
            </Html>
        </mesh>
    );
}

function PlayerAvatar({ url }: { url: string }) {
    return (
        <TextureErrorBoundary fallback={<PlayerAvatarFallback />}>
            <Suspense fallback={<PlayerAvatarFallback />}>
                <PlayerAvatarContent url={url} />
            </Suspense>
        </TextureErrorBoundary>
    );
}


function PlayerCard({
    player,
    position,
    rotation,
    isActive,
    onClick,
}: {
    player: PlayerData;
    position: [number, number, number];
    rotation: [number, number, number];
    isActive: boolean;
    onClick: () => void;
}) {
    const group = useRef<THREE.Group>(null);
    const materialParams = useMemo(
        () => ({
            color: isActive ? new THREE.Color(THEME.accent).multiplyScalar(1.5) : new THREE.Color(THEME.cardBg),
            metalness: 0.8,
            roughness: 0.2,
        }),
        [isActive]
    );

    useFrame((state, delta) => {
        if (group.current) {
            // Subtle floating animation
            // easing.damp3(group.current.position, position, 0.4, delta);

            // Tilt effect based on mouse (optional, kept simple for now)
        }
    });

    return (
        <Float
            speed={isActive ? 2 : 1}
            rotationIntensity={isActive ? 0.5 : 0.2}
            floatIntensity={isActive ? 0.5 : 0.2}
            position={position}
        >
            <group
                ref={group}
                rotation={rotation}
                onClick={onClick}
                onPointerOver={() => { document.body.style.cursor = 'pointer' }}
                onPointerOut={() => { document.body.style.cursor = 'auto' }}
            >
                {/* Card Background */}
                <mesh position={[0, 0, -0.05]}>
                    <boxGeometry args={[3, 4.5, 0.1]} />
                    <meshStandardMaterial
                        color={materialParams.color}
                        metalness={materialParams.metalness}
                        roughness={materialParams.roughness}
                        envMapIntensity={1.5}
                    />
                </mesh>

                {/* Glow Effect / Border when active */}
                {isActive && (
                    <mesh position={[0, 0, -0.1]}>
                        <planeGeometry args={[3.2, 4.7]} />
                        <meshBasicMaterial color={THEME.accent} toneMapped={false} />
                    </mesh>
                )}


                {/* Player Image */}
                <PlayerAvatar url={player.image} />


                {/* Text Details */}
                <group position={[0, -1.2, 0.1]}>
                    <Text
                        fontSize={0.25}
                        color={THEME.foreground}
                        anchorX="center"
                        anchorY="middle"
                        position={[0, 0.4, 0]}
                        fontWeight={800}
                    >
                        {player.name}
                    </Text>
                    <Text
                        fontSize={0.15}
                        color={THEME.accent}
                        anchorX="center"
                        anchorY="middle"
                        position={[0, 0.1, 0]}
                        fontWeight={700}
                        letterSpacing={0.1}
                    >
                        {player.role.toUpperCase()}
                    </Text>

                    {/* Stats Row */}
                    <group position={[0, -0.4, 0]}>
                        {player.stats.map((stat, i) => (
                            <group key={stat.label} position={[(i - 1) * 0.9, 0, 0]}>
                                <Text
                                    fontSize={0.22}
                                    fontWeight={900}
                                    color={THEME.foreground}
                                    position={[0, 0.1, 0]}
                                >
                                    {stat.value}
                                </Text>
                                <Text
                                    fontSize={0.1}
                                    fontWeight={600}
                                    color={THEME.textSecondary}
                                    position={[0, -0.15, 0]}
                                >
                                    {stat.label}
                                </Text>
                            </group>
                        ))}
                    </group>
                </group>
            </group>
        </Float>
    );
}

function Scene() {
    const [activeId, setActiveId] = useState<number | null>(2); // Center card active by default

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 0, 10]} />
            <OrbitControls
                enableZoom={false}
                enablePan={false}
                minPolarAngle={Math.PI / 2.5}
                maxPolarAngle={Math.PI / 1.5}
                rotateSpeed={0.5}
            />

            {/* Lighting */}
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
            <pointLight position={[-10, 5, 10]} intensity={1} color={THEME.accent} />
            <spotLight position={[0, 10, 0]} angle={0.5} penumbra={1} intensity={2} castShadow />

            {/* Environment */}
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <Sparkles count={50} scale={12} size={4} speed={0.4} opacity={0.5} color={THEME.accent} />
            <Environment preset="studio" />

            {/* Players */}
            <group position={[0, -0.5, 0]}>
                {PLAYERS.map((player, index) => {
                    // Calculate spacing based on index
                    // We want the center card (index 1) to be at x=0
                    // Left card (index 0) at x = -4
                    // Right card (index 2) at x = 4
                    const xPos = (index - 1) * 4;
                    const isActive = activeId === player.id;

                    return (
                        <PlayerCard
                            key={player.id}
                            player={player}
                            position={[xPos, 0, isActive ? 1 : 0]}
                            rotation={[0, isActive ? 0 : (index - 1) * -0.2, 0]} // Slight rotation for side cards
                            isActive={isActive}
                            onClick={() => setActiveId(player.id)}
                        />
                    );
                })}
            </group>
        </>
    );
}

export default function Player3DView() {
    return (
        <div style={{ width: "100%", height: "800px", position: "relative", background: "#0b0b0b", borderRadius: "20px", overflow: "hidden" }}>

            <Canvas gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}>
                <Suspense fallback={null}>
                    <Scene />
                </Suspense>
            </Canvas>

            {/* HTML Overlay for title if needed */}
            <div style={{
                position: "absolute",
                top: "20px",
                left: "50%",
                transform: "translateX(-50%)",
                textAlign: "center",
                color: "white",
                pointerEvents: "none",
                width: "100%",
                zIndex: 10
            }}>
                <h2 style={{
                    fontSize: "2rem",
                    fontWeight: "900",
                    textTransform: "uppercase",
                    letterSpacing: "2px",
                    background: `linear-gradient(to right, #fff, ${THEME.accent})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                }}>
                    Elite Squad
                </h2>
                <p style={{ opacity: 0.7, fontSize: "0.9rem" }}>Interact with the cards</p>
            </div>
        </div>
    );
}
