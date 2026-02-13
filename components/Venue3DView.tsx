"use client";

import React, { useRef, useState, useEffect, useMemo, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import {
    Environment,
    Html,
    Sky,
    OrbitControls,
    PerspectiveCamera,
    useTexture,
    Instances,
    Instance,
    Stars,
    BakeShadows,
    SoftShadows
} from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom, Vignette, ToneMapping } from '@react-three/postprocessing';

// --- Constants ---
const STADIUM_WIDTH = 180;
const STADIUM_LENGTH = 240;
const STADIUM_HEIGHT = 45;
const FIELD_WIDTH = 68;
const FIELD_LENGTH = 105;
const FIN_COUNT = 80;
const SEAT_TIERS = 3;

// --- Helper: Generate Stadium Shape Curve ---
function getStadiumCurve(width: number, length: number) {
    const shape = new THREE.Shape();
    const r = width / 2;
    const l = length - width; // Straight section length

    shape.absarc(l / 2, 0, r, -Math.PI / 2, Math.PI / 2, true);
    shape.absarc(-l / 2, 0, r, Math.PI / 2, -Math.PI / 2, true);
    shape.closePath();
    return shape;
}

// --- Procedural Textures (Memoized) ---
function useSportTextures() {
    return useMemo(() => {
        // 1. Pitch Texture
        const pitchCanvas = document.createElement('canvas');
        pitchCanvas.width = 1024;
        pitchCanvas.height = 1024;
        const ctx = pitchCanvas.getContext('2d')!;

        // Grass base
        ctx.fillStyle = '#2d5a27';
        ctx.fillRect(0, 0, 1024, 1024);

        // Mowing stripes
        ctx.fillStyle = '#3a6b32';
        const stripeCount = 15;
        const stripeW = 1024 / stripeCount;
        for (let i = 0; i < stripeCount; i++) {
            if (i % 2 === 0) ctx.fillRect(i * stripeW, 0, stripeW, 1024);
        }

        // Lines
        const scaleX = 1024 / (FIELD_LENGTH + 10);
        const scaleY = 1024 / (FIELD_WIDTH + 10);

        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx.lineWidth = 3;
        const margin = 50;

        // Border
        const fw = FIELD_LENGTH * scaleX;
        const fh = FIELD_WIDTH * scaleY;
        const fx = (1024 - fw) / 2;
        const fy = (1024 - fh) / 2;

        ctx.strokeRect(fx, fy, fw, fh);

        // Center line
        ctx.beginPath();
        ctx.moveTo(512, fy);
        ctx.lineTo(512, fy + fh);
        ctx.stroke();

        // Center circle
        ctx.beginPath();
        ctx.arc(512, 512, 9.15 * scaleX, 0, Math.PI * 2);
        ctx.stroke();

        const pitchMap = new THREE.CanvasTexture(pitchCanvas);
        pitchMap.anisotropy = 16;
        pitchMap.wrapS = THREE.ClampToEdgeWrapping;
        pitchMap.wrapT = THREE.ClampToEdgeWrapping;

        return { pitchMap };
    }, []);
}

// --- Dynamic Textures Hook (Separate for simpler logic if needed, but merged here for now) ---
function useStadiumTextures() {
    return useMemo(() => {
        // 1. Crowd / Seat Noise Texture
        const seatCanvas = document.createElement('canvas');
        seatCanvas.width = 512;
        seatCanvas.height = 512;
        const ctx = seatCanvas.getContext('2d')!;

        // Base dark blue
        ctx.fillStyle = '#1565C0';
        ctx.fillRect(0, 0, 512, 512);

        // Random noise for seats/people
        for (let i = 0; i < 30000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const w = Math.random() * 3 + 1;
            const h = Math.random() * 3 + 1;
            const rand = Math.random();
            if (rand > 0.6) ctx.fillStyle = '#C62828'; // Red seats
            else if (rand > 0.3) ctx.fillStyle = '#ffffff'; // White shirts
            else ctx.fillStyle = '#1976D2'; // Blue

            ctx.globalAlpha = 0.8;
            ctx.fillRect(x, y, w, h);
        }

        const seatMap = new THREE.CanvasTexture(seatCanvas);
        seatMap.wrapS = THREE.RepeatWrapping;
        seatMap.wrapT = THREE.RepeatWrapping;
        seatMap.repeat.set(20, 4);

        // 2. LED Ad Board Texture
        const adCanvas = document.createElement('canvas');
        adCanvas.width = 1024;
        adCanvas.height = 64;
        const adCtx = adCanvas.getContext('2d')!;

        // Gradient background
        const grad = adCtx.createLinearGradient(0, 0, 1024, 0);
        grad.addColorStop(0, '#ff0000');
        grad.addColorStop(0.2, '#0000ff');
        grad.addColorStop(0.4, '#ffffff');
        grad.addColorStop(0.6, '#ff0000');
        grad.addColorStop(0.8, '#0000ff');
        grad.addColorStop(1, '#ffffff');
        adCtx.fillStyle = grad;
        adCtx.fillRect(0, 0, 1024, 64);

        // Text "simulations"
        adCtx.fillStyle = 'rgba(255,255,255,0.9)';
        for (let i = 0; i < 10; i++) {
            adCtx.fillRect(i * 100 + 10, 10, 80, 44);
        }

        const adMap = new THREE.CanvasTexture(adCanvas);
        adMap.wrapS = THREE.RepeatWrapping;
        adMap.repeat.set(4, 1);

        // Animate ad map offset in useFrame if possible, but here just static return

        return { seatMap, adMap };
    }, []);
}

// --- Components ---

function Pitch() {
    const { pitchMap } = useSportTextures();
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0.1, 0]}>
            <planeGeometry args={[FIELD_LENGTH + 20, FIELD_WIDTH + 20]} />
            <meshStandardMaterial map={pitchMap} roughness={1} metalness={0} color="#bbf7d0" />
        </mesh>
    );
}

function StadiumStructure() {
    const curve = useMemo(() => getStadiumCurve(STADIUM_WIDTH, STADIUM_LENGTH), []);
    const { seatMap, adMap } = useStadiumTextures();

    // Animate Ad Board
    useFrame((state, delta) => {
        if (adMap) adMap.offset.x -= delta * 0.1;
    });

    // Extrude Settings for outer wall base
    const extrudeSettings = useMemo(() => ({
        steps: 2,
        depth: 5,
        bevelEnabled: false,
        curveSegments: 64
    }), []);

    // Roof Geometry: A ring following the shape
    const roofGeometry = useMemo(() => {
        const shape = getStadiumCurve(STADIUM_WIDTH + 10, STADIUM_LENGTH + 10);
        const hole = getStadiumCurve(STADIUM_WIDTH - 40, STADIUM_LENGTH - 40);
        shape.holes.push(hole);
        const geo = new THREE.ExtrudeGeometry(shape, { depth: 4, bevelEnabled: true, bevelThickness: 1, bevelSize: 1, curveSegments: 64 });
        geo.rotateX(-Math.PI / 2);
        return geo;
    }, []);

    // Concrete Fins Logic
    const finInstances = useMemo(() => {
        const points = curve.getSpacedPoints(FIN_COUNT);
        const tangentPoints = curve.getSpacedPoints(FIN_COUNT); // For calculating tangent
        const tempObj = new THREE.Object3D();
        const data: { position: [number, number, number], rotation: [number, number, number] }[] = [];

        for (let i = 0; i < points.length; i++) {
            const pt = points[i];
            // Calculate normal/tangent to orient fin
            // Simple approach: look at center? No, look along curve normal.
            // 2D Normal is (-y, x) of tangent

            const nextPt = points[(i + 1) % points.length];
            const prevPt = points[(i - 1 + points.length) % points.length];

            const tangent = new THREE.Vector2(nextPt.x - prevPt.x, nextPt.y - prevPt.y).normalize();
            const normal = new THREE.Vector2(-tangent.y, tangent.x);

            tempObj.position.set(pt.x, STADIUM_HEIGHT / 2, pt.y);
            // Rotate to face outward
            const angle = Math.atan2(normal.y, normal.x);
            tempObj.rotation.set(0, -angle, 0);

            data.push({
                position: [pt.x, 0, pt.y], // Position at ground level for the new fin geometry
                rotation: [0, -angle, 0]
            });
        }
        return data;
    }, [curve]);

    // Custom Fin Geometry (Curved)
    const finGeometry = useMemo(() => {
        const shape = new THREE.Shape();
        // Profile of the fin from side view (YZ plane relative to fin)
        // Starts wide at bottom, curves in, then out slightly at top
        shape.moveTo(0, 0); // Bottom Inside
        shape.lineTo(6, 0); // Bottom Outside thickness
        // Outer curve
        shape.bezierCurveTo(6, 15, 8, 30, 12, STADIUM_HEIGHT); // Curve out/up
        shape.lineTo(2, STADIUM_HEIGHT); // Top thicknes
        // Inner curve
        shape.bezierCurveTo(0, 30, -2, 15, 0, 0); // Curve back down

        const extrudeSettings = {
            depth: 2, // Thickness of the fin
            bevelEnabled: false
        };
        // Rotate so it stands up
        const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geo.center(); // Center to help with rotation
        // Fix pivot to bottom
        geo.translate(0, STADIUM_HEIGHT / 2, 0);
        return geo;
    }, []);

    // Roof Structure - The "Cloud" Ring
    const roofRingGeometry = useMemo(() => {
        // A large torus or tube
        const curve = new THREE.EllipseCurve(0, 0, STADIUM_WIDTH / 2 + 2, STADIUM_LENGTH / 2 - 12, 0, 2 * Math.PI, false, 0);
        const points = curve.getPoints(100);
        // Create a thicker shape for the roof
        const shape = new THREE.Shape(points);
        const holePath = new THREE.Path(new THREE.EllipseCurve(0, 0, STADIUM_WIDTH / 2 - 25, STADIUM_LENGTH / 2 - 40, 0, 2 * Math.PI, false, 0).getPoints(100));
        shape.holes.push(holePath);

        const geo = new THREE.ExtrudeGeometry(shape, { depth: 4, bevelEnabled: true, bevelThickness: 1, bevelSize: 0.5, curveSegments: 128 });
        geo.rotateX(Math.PI / 2); // Flip to flat
        return geo;
    }, []);

    return (
        <group>
            {/* Main Fascia / Branding Ring */}
            <mesh position={[0, STADIUM_HEIGHT - 2, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
                <ringGeometry args={[STADIUM_WIDTH / 2 + 3, STADIUM_WIDTH / 2 + 8, 128]} />
                <meshStandardMaterial color="#001C55" roughness={0.3} /> {/* PSG Navy */}
            </mesh>

            {/* White Roof Top */}
            <mesh geometry={roofRingGeometry} position={[0, STADIUM_HEIGHT, 0]} castShadow receiveShadow>
                <meshStandardMaterial color="#f8f9fa" roughness={0.4} />
            </mesh>

            {/* Inner Glass Roof */}
            <mesh position={[0, STADIUM_HEIGHT - 1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[FIELD_WIDTH + 10, STADIUM_WIDTH / 2 - 20, 64]} />
                <meshPhysicalMaterial
                    color="white"
                    transmission={0.2}
                    opacity={0.3}
                    transparent
                    roughness={0.1}
                    thickness={0.1}
                />
            </mesh>

            {/* Curved Fins - Instanced */}
            <Instances range={FIN_COUNT} geometry={finGeometry}>
                <meshStandardMaterial color="#e0e0e0" roughness={0.6} />
                {finInstances.map((d, i) => (
                    <Instance key={i} position={d.position} rotation={d.rotation} />
                ))}
            </Instances>

            {/* Seating Bowl - 2 Tiers */}
            <group position={[0, 5, 0]}>
                {/* Lower Tier */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 6, 0]} receiveShadow>
                    <ringGeometry args={[FIELD_WIDTH / 2 + 12, STADIUM_WIDTH / 2 - 15, 128]} />
                    <meshStandardMaterial map={seatMap} roughness={0.9} color="#1565C0" />
                </mesh>
                {/* Upper Tier */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 18, 0]} receiveShadow>
                    <ringGeometry args={[STADIUM_WIDTH / 2 - 12, STADIUM_WIDTH / 2 + 5, 128]} />
                    <meshStandardMaterial map={seatMap} roughness={0.9} color="#0D47A1" />
                </mesh>

                {/* LED Ribbon Board (between tiers) */}
                <mesh rotation={[0, 0, 0]} position={[0, 16, 0]}>
                    <cylinderGeometry args={[STADIUM_WIDTH / 2 - 12, STADIUM_WIDTH / 2 - 12, 1.5, 128, 1, true]} />
                    <meshBasicMaterial map={adMap} color={[1.5, 1.5, 1.5]} toneMapped={false} side={THREE.DoubleSide} />
                </mesh>
            </group>

            {/* Floodlights */}
            {[
                [100, STADIUM_HEIGHT + 5, 80],
                [-100, STADIUM_HEIGHT + 5, 80],
                [100, STADIUM_HEIGHT + 5, -80],
                [-100, STADIUM_HEIGHT + 5, -80]
            ].map((pos, i) => (
                <mesh key={`light-${i}`} position={pos as [number, number, number]} rotation={[0, 0, 0]}>
                    <boxGeometry args={[4, 2, 4]} />
                    <meshStandardMaterial emissive="white" emissiveIntensity={2} color="white" toneMapped={false} />
                    <pointLight intensity={200} distance={200} color="#ffffff" decay={2} castShadow />
                </mesh>
            ))}

            {/* Stadium Base/Plaza */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} receiveShadow>
                <planeGeometry args={[450, 450]} />
                <meshStandardMaterial color="#333" roughness={0.9} />
            </mesh>

            {/* Entrance Feature (The Curved Building) */}
            <mesh position={[0, 6, STADIUM_LENGTH / 2 + 25]} castShadow receiveShadow>
                <cylinderGeometry args={[40, 40, 12, 64, 1, false, 0, Math.PI]} />
                <meshStandardMaterial color="#f0f0f0" />
            </mesh>
            {/* Glass facade for entrance */}
            <mesh position={[0, 6, STADIUM_LENGTH / 2 + 25.5]}>
                <cylinderGeometry args={[40.5, 40.5, 10, 64, 1, true, 0, Math.PI]} />
                <meshPhysicalMaterial color="blue" transmission={0.4} opacity={0.6} transparent roughness={0} />
            </mesh>
            {/* "ICI C'EST PARIS" branding could go here as texture */}

        </group>
    );
}

function Surroundings() {
    // Generate random trees
    const trees = useMemo(() => {
        const temp = [];
        for (let i = 0; i < 60; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 140 + Math.random() * 100;
            const x = Math.cos(angle) * dist;
            const z = Math.sin(angle) * dist;
            const scale = 0.8 + Math.random() * 0.4;
            temp.push({ position: [x, 0, z] as [number, number, number], scale });
        }
        return temp;
    }, []);

    return (
        <group>
            {/* Roads with traffic lights simulation */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 180]} receiveShadow>
                <planeGeometry args={[1000, 25]} />
                <meshStandardMaterial color="#1a1a1a" />
            </mesh>
            {/* Car Lights (Static for performance, but glowing) */}
            <Instances range={40}>
                <boxGeometry args={[2, 0.5, 4]} />
                <meshBasicMaterial color={[2, 2, 1]} toneMapped={false} /> {/* Headlights color */}
                {Array.from({ length: 20 }).map((_, i) => (
                    <Instance key={`head-${i}`} position={[(Math.random() - 0.5) * 800, 0.5, 185 + (Math.random() - 0.5) * 10]} />
                ))}
                <meshBasicMaterial color={[2, 0, 0]} toneMapped={false} /> {/* Tail lights color */}
                {Array.from({ length: 20 }).map((_, i) => (
                    <Instance key={`tail-${i}`} position={[(Math.random() - 0.5) * 800, 0.5, 175 + (Math.random() - 0.5) * 10]} />
                ))}
            </Instances>

            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[180, 0.02, 0]} receiveShadow>
                <planeGeometry args={[25, 1000]} />
                <meshStandardMaterial color="#1a1a1a" />
            </mesh>

            {/* Trees Instanced */}
            <Instances range={60}>
                <coneGeometry args={[3, 12, 8]} />
                <meshStandardMaterial color="#2d4c1e" roughness={0.8} />
                {trees.map((t, i) => (
                    <group key={i} position={t.position} scale={[t.scale, t.scale, t.scale]}>
                        <Instance position={[0, 6, 0]} />
                        {/* Trunk */}
                        <mesh position={[0, 1, 0]}>
                            <cylinderGeometry args={[0.5, 0.8, 4]} />
                            <meshStandardMaterial color="#3e2723" />
                        </mesh>
                    </group>
                ))}
            </Instances>
        </group>
    )
}

function SceneContent({ timeOfDay, viewMode, setViewMode }: { timeOfDay: number, viewMode: string, setViewMode: (m: string) => void }) {
    const controlsRef = useRef<any>(null);

    // Sun Position calculation
    const sunPosition = useMemo(() => {
        const phi = (2 * Math.PI * (timeOfDay - 6)) / 24; // 0-24h mapped to angle
        // Simple arc
        const x = Math.cos(phi) * 200;
        const y = Math.sin(Math.PI * (timeOfDay - 6) / 12) * 150; // simple elevation
        const z = Math.sin(phi) * 100;
        return new THREE.Vector3(x, Math.max(y, -20), z); // Keep sun from going too deep underground
    }, [timeOfDay]);

    // Camera Animations
    useEffect(() => {
        if (!controlsRef.current) return;

        const camera = controlsRef.current.object;
        const target = controlsRef.current.target;

        switch (viewMode) {
            case 'Orbit':
                camera.position.set(250, 150, 250);
                target.set(0, 0, 0);
                controlsRef.current.minDistance = 50;
                controlsRef.current.maxDistance = 500;
                break;
            case 'Top':
                camera.position.set(0, 300, 10);
                target.set(0, 0, 0);
                break;
            case 'Pitch':
                camera.position.set(0, 5, -40);
                target.set(0, 5, 0);
                break;
            case 'Drone':
                camera.position.set(100, 80, 100);
                target.set(0, 20, 0);
                break;
        }
        controlsRef.current.update();
    }, [viewMode]);

    return (
        <>
            <directionalLight
                position={sunPosition}
                intensity={Math.max(0, Math.sin(Math.PI * (timeOfDay - 6) / 12)) * 2.5}
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-bias={-0.0001}
            >
                <orthographicCamera attach="shadow-camera" args={[-200, 200, 200, -200, 1, 500]} />
            </directionalLight>

            <ambientLight intensity={timeOfDay > 6 && timeOfDay < 18 ? 0.4 : 0.1} />
            <hemisphereLight groundColor="#000000" intensity={0.2} />

            <Sky
                sunPosition={sunPosition}
                turbidity={0.5}
                rayleigh={0.6}
                mieCoefficient={0.005}
                mieDirectionalG={0.8}
            />
            {timeOfDay < 6 || timeOfDay > 18 ? <Stars radius={300} fade count={5000} /> : null}

            <Environment preset={timeOfDay > 6 && timeOfDay < 18 ? "city" : "night"} blur={0.8} background={false} />

            {/* FOG logic */}
            <fog attach="fog" args={[timeOfDay > 6 && timeOfDay < 18 ? '#cfe7ff' : '#050510', 100, 800]} />

            <group position={[0, -2, 0]}>
                <StadiumStructure />
                <Pitch />
                <Surroundings />
            </group>

            <OrbitControls
                ref={controlsRef}
                enableDamping
                dampingFactor={0.1}
                maxPolarAngle={Math.PI / 2 - 0.05}
                autoRotate={viewMode === 'Orbit'}
                autoRotateSpeed={0.5}
            />

            <EffectComposer enableNormalPass={false}>
                <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} />
                <ToneMapping />
                <Vignette eskil={false} offset={0.1} darkness={1.1} />
            </EffectComposer>
        </>
    );
}


// --- Main Modal Wrapper ---

function VenueModalInternal({ venueName, onClose }: { venueName: string, onClose: () => void }) {
    const [timeOfDay, setTimeOfDay] = useState(14); // 14:00 (2 PM)
    const [viewMode, setViewMode] = useState('Orbit');
    const [mounted, setMounted] = useState(false);

    // Focus / Scroll Lock hook logic inline or reused
    useEffect(() => {
        setMounted(true);
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKey);

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener('keydown', handleKey);
        }
    }, [onClose]);

    if (!mounted) return null;

    return createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'black', fontFamily: 'var(--font-sans)' }}>
            <Canvas shadows dpr={[1, 1.5]} gl={{ antialias: false }}>
                <Suspense fallback={null}>
                    <SceneContent timeOfDay={timeOfDay} viewMode={viewMode} setViewMode={setViewMode} />
                </Suspense>
            </Canvas>

            {/* UI Overlay */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>

                {/* Header */}
                <div style={{ position: 'absolute', top: '24px', left: '32px', pointerEvents: 'auto' }}>
                    <h1 style={{ color: 'white', fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase', lineHeight: 1, margin: 0 }}>
                        {venueName}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                        <div style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 10px #22c55e' }} />
                        <span style={{ color: 'white', opacity: 0.8, fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px' }}>LIVE SIMULATION</span>
                    </div>
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '24px', right: '32px',
                        width: '48px', height: '48px', borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white',
                        display: 'grid', placeItems: 'center', backdropFilter: 'blur(10px)',
                        cursor: 'pointer', pointerEvents: 'auto', fontSize: '1.2rem', transition: 'all 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                    onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                    ✕
                </button>

                {/* Bottom Controls Panel */}
                <div style={{
                    position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
                    width: 'min(90vw, 800px)', padding: '24px',
                    background: 'rgba(10,10,10,0.8)', backdropFilter: 'blur(16px)', borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.1)', pointerEvents: 'auto',
                    display: 'flex', flexDirection: 'column', gap: '20px'
                }}>

                    {/* View Modes */}
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {['Orbit', 'Top', 'Pitch', 'Drone'].map(mode => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                style={{
                                    padding: '10px 20px', borderRadius: '12px',
                                    border: viewMode === mode ? '1px solid #ff385c' : '1px solid rgba(255,255,255,0.1)',
                                    background: viewMode === mode ? '#ff385c' : 'transparent',
                                    color: 'white', fontWeight: 700,
                                    cursor: 'pointer', transition: 'all 0.2s', textTransform: 'uppercase', fontSize: '0.8rem'
                                }}
                            >
                                {mode} View
                            </button>
                        ))}
                    </div>

                    {/* Time Slider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ color: 'white', fontSize: '1.2rem' }}>{timeOfDay > 6 && timeOfDay < 18 ? '☀️' : '🌙'}</span>
                        <input
                            type="range" width="100%" min="0" max="24" step="0.1"
                            value={timeOfDay}
                            onChange={(e) => setTimeOfDay(parseFloat(e.target.value))}
                            style={{ flex: 1, accentColor: '#ff385c', cursor: 'grab' }}
                        />
                        <span style={{ color: 'white', fontFamily: 'monospace', fontWeight: 600, width: '60px' }}>
                            {Math.floor(timeOfDay).toString().padStart(2, '0')}:
                            {Math.floor((timeOfDay % 1) * 60).toString().padStart(2, '0')}
                        </span>
                    </div>

                </div>

            </div>
        </div>,
        document.body
    );
}

export default function Venue3DView({ venueName, onClose }: { venueName: string, onClose?: () => void }) {
    // Only render if mounted (client-side) to avoid hydration mismatch
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) return null;
    return <VenueModalInternal venueName={venueName} onClose={onClose || (() => { })} />;
}
