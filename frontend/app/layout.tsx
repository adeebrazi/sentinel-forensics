"use client";
import React, { useRef, useMemo } from "react";
import "./globals.css";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { Video, Search, Activity, Cpu, Lock, Telescope } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { GoogleOAuthProvider } from '@react-oauth/google';

/* ---------- 3D STARFIELD (Deep Space) ---------- */
function StarLayer({ count, radius, size, opacity }: any) {
  const geo = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = radius * (0.6 + Math.random() * 0.8);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [count, radius]);

  return (
    <points geometry={geo}>
      <pointsMaterial 
        size={size} 
        transparent 
        opacity={1.0} 
        color="#ffffff" 
        blending={THREE.AdditiveBlending} 
        depthWrite={false} 
        sizeAttenuation={true} 
      />
    </points>
  );
}

/* ---------- 3D PLANET WITH NASA TEXTURES ---------- */
function Planet({ p }: { p: any }) {
  const ref = useRef<THREE.Mesh>(null);
  
  const texture = useMemo(() => {
    if (!p.textureUrl) return null;
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "Anonymous";
    return loader.load(p.textureUrl);
  }, [p.textureUrl]);

  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.5; });

  return (
    <group position={p.pos}>
      <mesh ref={ref}>
        <sphereGeometry args={[p.radius, 64, 64]} />
        <meshStandardMaterial 
          map={texture} 
          color={texture ? "#ffffff" : p.color} 
          roughness={0.8} 
          metalness={0.1} 
        />
      </mesh>

      {p.glow && (
        <mesh>
          <sphereGeometry args={[p.radius * 1.15, 64, 64]} />
          <meshBasicMaterial color={p.glow} transparent opacity={0.15} blending={THREE.AdditiveBlending} side={THREE.BackSide} depthWrite={false} />
        </mesh>
      )}

      {/* PLANET LABELS */}
      <Html position={[0, p.radius + 8, 0]} center className="pointer-events-none">
        <div className="text-[11px] font-corpta text-white uppercase tracking-[0.4em] whitespace-nowrap drop-shadow-[0_0_8px_rgba(255,255,255,1)]">
          {p.name}
        </div>
      </Html>

      {p.ring && (
        <mesh rotation={[Math.PI / 2, 0.3, 0]}>
          <ringGeometry args={[p.radius * 1.4, p.radius * 2.2, 64]} />
          <meshBasicMaterial color={p.ringColor} transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

/* ---------- SLOW-MOTION PLANETARY SYSTEM ---------- */
function RevolutionWrapper() {
  const worldRef = useRef<THREE.Group>(null);
  
  const TEX_EARTH = "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg";
  const TEX_JUPITER = "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/jupiter.jpg";
  const TEX_MOON = "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg";

  const PLANETS = [
    { name: "Mercury", pos: [-50, 5, 0], radius: 3, textureUrl: TEX_MOON, color: "#999", glow: "#ffffff" },
    { name: "Venus", pos: [80, -10, 40], radius: 6, color: "#e3bb76", glow: "#ffcc66" },
    { name: "Earth", pos: [-120, 0, -20], radius: 6.5, textureUrl: TEX_EARTH, color: "#2b82c9", glow: "#44aaff" },
    { name: "Mars", pos: [-160, 15, -60], radius: 5, color: "#ff5533", glow: "#ff4400" },
    { name: "Jupiter", pos: [220, -20, -100], radius: 18, textureUrl: TEX_JUPITER, color: "#ebae71", glow: "#ffaa66" },
    { name: "Saturn", pos: [-300, 30, -140], radius: 15, color: "#f5d691", glow: "#ffeecc", ring: true, ringColor: "#d9b97a" },
    { name: "Uranus", pos: [380, -5, -180], radius: 10, color: "#afeeee", glow: "#88ffff" },
    { name: "Neptune", pos: [-440, -25, -220], radius: 9, color: "#4169e1", glow: "#5588ff" },
  ];

  useFrame((_, dt) => { if (worldRef.current) worldRef.current.rotation.y += dt * 0.03; });

  return (
    <group ref={worldRef}>
      {/* Central light source so planets are visible without a physical sun mesh */}
      <pointLight intensity={5} distance={1500} color="#ffffff" position={[0,0,0]} />
      {PLANETS.map((p, i) => <Planet key={i} p={p} />)}
    </group>
  );
}

function SolarSystemBackground() {
  return (
    <div className="fixed inset-0 -z-50 bg-[#000103]">
      <Canvas camera={{ position: [0, 200, 500], fov: 60 }} dpr={[1, 2]} gl={{ antialias: true }}>
        <ambientLight intensity={0.4} />
        <StarLayer count={30000} radius={1200} size={2.5} opacity={1.0} />
        <RevolutionWrapper />
      </Canvas>
    </div>
  );
}

export default function ForensicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [role, setRole] = React.useState<string | null>(null);
  const [userId, setUserId] = React.useState<string | null>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setRole(localStorage.getItem('userRole') || null);
    setUserId(localStorage.getItem('userId') || null);
    setMounted(true);
  }, [pathname]);

  const menu = [
    { name: 'UPLOADER', icon: Video, path: '/ingestion', roles: ['admin', 'employee'] },
    { name: 'ANALYSIS', icon: Search, path: '/admin', roles: ['admin'] },
  ];

  const visibleMenu = menu.filter(item => !role || item.roles.includes(role));

  const isLoginPage = pathname === '/';
  const isTvRoute = pathname.startsWith('/tv');
  const isAboutRoute = pathname.startsWith('/about');
  const isPublicRoute = isTvRoute || isAboutRoute;
  const showForensicsLayout = !isLoginPage && !isPublicRoute;

  return (
    <html lang="en">
      <body className="flex h-screen w-screen overflow-hidden text-slate-200 font-corpta bg-[#000103]">
        <GoogleOAuthProvider clientId="549433169493-9i2anc6fbjujupr6adjtpcc8f4u3ief0.apps.googleusercontent.com">
          
          {/* Only show the space background for the forensics app */}
          {!isPublicRoute && <SolarSystemBackground />}
          
          {showForensicsLayout && mounted && (
            <aside className="w-20 border-r border-cyan-500/10 bg-black/60 backdrop-blur-xl flex flex-col items-center py-10 space-y-12 z-50">
              <Link href="/ingestion">
                <div className="w-10 h-10 border border-cyan-500 rounded-lg flex items-center justify-center rotate-45 shadow-[0_0_15px_rgba(0,210,255,0.3)]">
                  <Cpu className="-rotate-45 text-cyan-400" size={20} />
                </div>
              </Link>
            <nav className="flex-1 flex flex-col gap-8">
              {visibleMenu.map((item) => (
                <Link key={item.name} href={item.path} 
                  className={`p-4 rounded-xl transition-all ${pathname === item.path ? 'bg-cyan-500/30 text-cyan-400 shadow-lg' : 'text-slate-500 hover:text-cyan-500'}`}>
                  <item.icon size={22} />
                </Link>
              ))}
            </nav>
            </aside>
          )}

        <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
          {showForensicsLayout && mounted && (
            <header className="h-14 px-10 flex items-center justify-between border-b border-cyan-500/10 bg-black/40 backdrop-blur-md">
              <div className="flex items-center gap-6">
                <h1 className="text-2xl font-black italic text-cyan-400 tracking-wider">SENTINEL FORENSICS</h1>
                <span className="text-[8px] text-cyan-900 tracking-widest font-bold uppercase mt-1">System_Active</span>
              </div>
              <div className="flex items-center gap-6">
                {userId && (
                  <div className="flex flex-col items-end border-r border-cyan-500/20 pr-6">
                    <span className="text-[10px] text-white font-bold tracking-widest lowercase opacity-80">
                      {userId}
                    </span>
                    <span className="text-[9px] text-cyan-500 font-black uppercase tracking-[0.2em]">
                      Clearance: {role}
                    </span>
                  </div>
                )}
                <button 
                  onClick={() => {
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('userId');
                    window.location.href = '/';
                  }}
                  className="flex items-center gap-2 p-2 px-3 bg-red-500/5 border border-red-500/20 rounded-md hover:bg-red-500/20 hover:border-red-500/50 transition-all group"
                  title="Disconnect Session"
                >
                  <Lock size={12} className="text-red-500 group-hover:animate-pulse" />
                  <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest">Logout</span>
                </button>
              </div>
            </header>
          )}

          <div className={`flex-1 overflow-hidden ${!isPublicRoute && 'p-8'}`}>
            {showForensicsLayout && !role && mounted ? (
              <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-black/50 p-8 text-center animate-in fade-in zoom-in duration-500">
                <Lock className="text-cyan-600 animate-pulse" size={80} />
                <h1 className="font-display text-4xl font-black tracking-widest text-cyan-500">
                  SYSTEM LOCKED
                </h1>
                <p className="font-mono-tech text-sm tracking-widest text-cyan-500/70">
                  KINDLY LOGIN TO PROCEED.
                </p>
                <Link href="/">
                  <button className="mt-4 px-8 py-3 border border-cyan-500/50 rounded hover:bg-cyan-500/10 text-cyan-400 font-bold tracking-widest uppercase transition-all">
                    Return to Portal
                  </button>
                </Link>
              </div>
            ) : (
              children
            )}
          </div>
        </main>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
