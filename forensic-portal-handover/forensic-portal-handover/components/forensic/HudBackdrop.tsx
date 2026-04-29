import { motion } from "framer-motion";

export const HudBackdrop = () => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Large central HUD ring system - behind portal */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative aspect-square w-[120vmin] max-w-[1100px]">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border border-primary/15 animate-spin-slow" />
          {/* Dashed mid */}
          <div className="absolute inset-[8%] rounded-full border border-dashed border-primary/12 animate-spin-reverse" />
          {/* Thin inner */}
          <div className="absolute inset-[18%] rounded-full border border-primary/10" />
          <div className="absolute inset-[28%] rounded-full border border-primary/8 animate-spin-slow" />
          {/* Crosshairs */}
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-primary/15 to-transparent" />
          <div className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-gradient-to-r from-transparent via-primary/15 to-transparent" />
          {/* Tick marks around outer ring */}
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="absolute left-1/2 top-1/2 h-3 w-px bg-primary/30 origin-top"
              style={{
                transform: `translateX(-50%) rotate(${i * 15}deg) translateY(-50%) translateY(-49%)`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Top-left orbital cluster */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.4 }}
        className="absolute -left-24 top-10 h-72 w-72 md:left-8 md:top-16"
      >
        <div className="relative h-full w-full">
          <div className="absolute inset-0 rounded-full border border-primary/20 animate-spin-reverse" />
          <div className="absolute inset-[15%] rounded-full border border-dashed border-primary/15 animate-spin-slow" />
          <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary animate-pulse-cyan" />
        </div>
      </motion.div>

      {/* Bottom-right targeting reticle */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.6 }}
        className="absolute -right-20 bottom-10 h-80 w-80 md:right-12 md:bottom-20"
      >
        <div className="relative h-full w-full">
          <div className="absolute inset-0 rounded-full border border-primary/15 animate-spin-slow" />
          <div className="absolute inset-[20%] rounded-full border border-primary/12 animate-spin-reverse" />
          <div className="absolute inset-[40%] rounded-full border border-dashed border-primary/20" />
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute left-1/2 top-1/2 h-2 w-px bg-primary/40 origin-top"
              style={{ transform: `translateX(-50%) rotate(${i * 45}deg) translateY(-50%) translateY(-46%)` }}
            />
          ))}
        </div>
      </motion.div>

    </div>
  );
};
