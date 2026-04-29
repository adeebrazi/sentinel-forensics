"use client";
import { motion } from "framer-motion";
import { ZoomIn, Compass } from "lucide-react";

export default function ObservatoryPage() {
  return (
    <div className="h-full w-full flex flex-col justify-between items-start pointer-events-none">
      {/* Top Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/20 backdrop-blur-md border border-cyan-500/10 p-6 rounded-[2rem] max-w-md pointer-events-auto"
      >
        <div className="flex items-center gap-4 mb-2">
          <Compass className="text-cyan-400 animate-spin-slow" size={20} />
          <h2 className="text-xl font-black italic tracking-tighter text-white">
            CELESTIAL OBSERVATORY
          </h2>
        </div>
        <p className="text-[10px] text-cyan-500/60 leading-relaxed uppercase tracking-widest font-bold">
          Live feed from Sentinel-4 Deep Space Array. Monitoring planetary
          shifts and nebula dispersion.
        </p>
      </motion.div>

      {/* Bottom HUD info */}
      <div className="w-full flex justify-between items-end">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hacker-card p-6 border-l-2 border-l-cyan-400 pointer-events-auto"
        >
          <div className="flex items-center gap-3 mb-2">
            <ZoomIn className="text-cyan-400" size={16} />
            <span className="text-[9px] font-black text-white uppercase tracking-widest">
              Visibility: 98.4%
            </span>
          </div>
          <p className="text-[8px] font-mono text-cyan-800">
            COORDINATES: ALPHA-CENTAURI / SECTOR-7G
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hacker-card p-6 bg-black/60 pointer-events-auto"
        >
          <p className="text-[9px] font-black text-cyan-500 mb-2 uppercase tracking-tighter">
            Current Monitoring:
          </p>
          <div className="flex gap-4">
            {["SOL", "JUPITER", "SATURN"].map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded text-cyan-300 font-bold tracking-tighter uppercase"
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
