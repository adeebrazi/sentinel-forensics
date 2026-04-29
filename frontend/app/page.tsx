"use client";
import { AccessPortal } from "@/components/forensic/AccessPortal";
import Link from "next/link";
import { Users } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="absolute top-8 right-8 z-50">
        <Link href="/about">
          <button className="flex items-center gap-2 px-4 py-2 bg-cyan-950/30 border border-cyan-500/30 text-cyan-400 rounded-full hover:bg-cyan-500/20 hover:border-cyan-400 transition-all text-xs font-black uppercase tracking-widest group shadow-lg shadow-cyan-900/20 backdrop-blur-md">
            <Users size={14} className="group-hover:scale-110 transition-transform" />
            Know the Team
          </button>
        </Link>
      </div>
      <AccessPortal />
    </div>
  );
}
