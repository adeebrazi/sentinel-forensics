"use client";
import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ---------- Multi-layer starfield ---------- */
function StarLayer({
  count, radius, size, opacity, twinkle = false, colorMix = false, bandBias = 0,
}: {
  count: number; radius: number; size: number; opacity: number;
  twinkle?: boolean; colorMix?: boolean;
  bandBias?: number;
}) {
  const ref = useRef<THREE.Points>(null);
  const mat = useRef<THREE.PointsMaterial>(null);

  const geo = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = [[1, 1, 1], [0.85, 0.92, 1], [1, 0.92, 0.78], [1, 0.78, 0.6], [0.78, 0.85, 1]];
    
    for (let i = 0; i < count; i++) {
      let u = Math.random() * 2 - 1;
      if (bandBias > 0) u = u * (1 - bandBias) * 0.35;
      const t = Math.random() * Math.PI * 2;
      const s = Math.sqrt(Math.max(0, 1 - u * u));
      const r = radius * (0.85 + Math.random() * 0.3);
      positions[i * 3] = r * s * Math.cos(t);
      positions[i * 3 + 1] = r * u;
      positions[i * 3 + 2] = r * s * Math.sin(t);

      const c = colorMix ? palette[Math.floor(Math.random() * palette.length)] : [1, 1, 1];
      const b = 0.6 + Math.random() * 0.4;
      colors[i * 3] = c[0] * b;
      colors[i * 3 + 1] = c[1] * b;
      colors[i * 3 + 2] = c[2] * b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, [count, radius, colorMix, bandBias]);

  useFrame((state, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.0035;
    if (twinkle && mat.current) {
      mat.current.opacity = opacity * (0.78 + 0.22 * Math.sin(state.clock.elapsedTime * 1.4));
    }
  });

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial
        ref={mat}
        size={size}
        sizeAttenuation
        transparent
        opacity={opacity}
        vertexColors
        depthWrite={false}
      />
    </points>
  );
}

/* ---------- Nebula clouds ---------- */
function NebulaCloud({ position, color, scale }: { position: [number, number, number]; color: string; scale: number; }) {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256; c.height = 256;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, "rgba(255,255,255,0.55)");
    g.addColorStop(0.4, "rgba(255,255,255,0.18)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, []);

  return (
    <sprite position={position} scale={[scale, scale, 1]}>
      <spriteMaterial
        map={tex}
        color={color}
        transparent
        opacity={0.15}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </sprite>
  );
}

/* ---------- Planetary System ---------- */
const DISTANT_PLANETS = [
  { pos: [-32, 8, -55] as [number, number, number], radius: 1.6, color: "#c1502e", glow: "#5a2010" },
  { pos: [38, -6, -70] as [number, number, number], radius: 3.2, color: "#d6b48a", glow: "#3a2a18" },
  { pos: [60, 14, -90] as [number, number, number], radius: 2.4, color: "#e6c98a", ring: { inner: 1.4, outer: 2.4, color: "#d9b97a", tilt: 0.45 }, glow: "#2a2010" },
];

function Planet({ p }: { p: any }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.1; });
  return (
    <group position={p.pos}>
      {p.glow && (
        <sprite scale={[p.radius * 6, p.radius * 6, 1]}>
          <spriteMaterial color={p.glow} transparent opacity={0.25} depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
      )}
      <mesh ref={ref}>
        <sphereGeometry args={[p.radius, 32, 32]} />
        <meshStandardMaterial color={p.color} roughness={0.9} />
      </mesh>
      {p.ring && (
        <mesh rotation={[Math.PI / 2 - p.ring.tilt, 0, 0]}>
          <ringGeometry args={[p.radius * p.ring.inner, p.radius * p.ring.outer, 64]} />
          <meshBasicMaterial color={p.ring.color} transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[-90, 30, -140]} intensity={1.5} color={"#ffd9a8"} />
      <StarLayer count={5000} radius={140} size={0.2} opacity={0.6} colorMix />
      <StarLayer count={2000} radius={80} size={0.4} opacity={0.8} twinkle colorMix />
      <NebulaCloud position={[-40, 4, -90]} color={"#5a3a8a"} scale={100} />
      <NebulaCloud position={[50, -6, -110]} color={"#2a4a8a"} scale={130} />
      {DISTANT_PLANETS.map((p, i) => <Planet key={i} p={p} />)}
    </>
  );
}

export default function SolarSystemBackground() {
  return (
    <div className="fixed inset-0 -z-50 bg-black">
      <Canvas
        camera={{ position: [0, 0, 20], fov: 60 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={["#000000"]} />
        <Scene />
      </Canvas>
    </div>
  );
}
