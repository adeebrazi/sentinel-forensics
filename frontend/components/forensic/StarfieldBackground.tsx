import { useEffect, useRef } from "react";

interface Node { x: number; y: number; vx: number; vy: number; r: number; ox: number; oy: number; }

export const StarfieldBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const NODE_COUNT = Math.min(110, Math.floor((w * h) / 18000));
    const makeNode = (): Node => {
      const x = Math.random() * w;
      const y = Math.random() * h;
      return {
        x, y, ox: x, oy: y,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        r: Math.random() * 1.4 + 0.4,
      };
    };
    const nodes: Node[] = Array.from({ length: NODE_COUNT }, makeNode);

    const stars: { x: number; y: number; o: number; tw: number; depth: number }[] = Array.from({ length: 180 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      o: Math.random() * 0.6 + 0.1,
      tw: Math.random() * 0.02 + 0.005,
      depth: Math.random() * 0.6 + 0.1,
    }));

    // Mouse tracking — smoothed
    const mouse = { x: w / 2, y: h / 2, active: false };
    const smoothMouse = { x: w / 2, y: h / 2 };

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const onLeave = () => { mouse.active = false; };
    const onTouch = (e: TouchEvent) => {
      if (e.touches.length) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        mouse.active = true;
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("touchmove", onTouch, { passive: true });

    let raf = 0;
    let t = 0;

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const INFLUENCE_RADIUS = 220;        // px around cursor that pulls nodes
    const INFLUENCE_RADIUS_SQ = INFLUENCE_RADIUS * INFLUENCE_RADIUS;
    const REPEL_STRENGTH = 0.6;          // how strongly cursor pushes nodes
    const RETURN_STRENGTH = 0.012;       // pull back to original anchor
    const LINE_RADIUS_SQ = 26000;        // connection distance squared
    const CURSOR_LINK_RADIUS_SQ = 32000; // direct line cursor → node

    const render = () => {
      t += 1;

      // Smooth mouse for parallax
      smoothMouse.x += (mouse.x - smoothMouse.x) * 0.08;
      smoothMouse.y += (mouse.y - smoothMouse.y) * 0.08;
      const parX = (smoothMouse.x - w / 2) / w;  // -0.5..0.5
      const parY = (smoothMouse.y - h / 2) / h;

      ctx.fillStyle = "rgba(2, 8, 12, 0.55)";
      ctx.fillRect(0, 0, w, h);

      // Stars with parallax (deeper = less drift)
      for (const s of stars) {
        const px = s.x - parX * 30 * s.depth;
        const py = s.y - parY * 30 * s.depth;
        const flicker = Math.sin(t * s.tw) * 0.3 + 0.7;
        ctx.fillStyle = `hsla(180, 100%, 88%, ${s.o * flicker})`;
        ctx.fillRect(px, py, 1, 1);
      }

      // Subtle scan grid — drifts slightly opposite cursor
      ctx.strokeStyle = "hsla(184, 100%, 52%, 0.04)";
      ctx.lineWidth = 1;
      const grid = 80;
      const gx = -parX * 12;
      const gy = -parY * 12;
      for (let x = (gx % grid); x < w; x += grid) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = (gy % grid); y < h; y += grid) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // Update nodes — drift, anchor return, cursor repel
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;

        // Pull back toward original anchor (so they don't drift forever)
        n.vx += (n.ox - n.x) * RETURN_STRENGTH * 0.05;
        n.vy += (n.oy - n.y) * RETURN_STRENGTH * 0.05;

        // Cursor repel
        if (mouse.active) {
          const dx = n.x - smoothMouse.x;
          const dy = n.y - smoothMouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < INFLUENCE_RADIUS_SQ && d2 > 1) {
            const d = Math.sqrt(d2);
            const force = (1 - d / INFLUENCE_RADIUS) * REPEL_STRENGTH;
            n.vx += (dx / d) * force;
            n.vy += (dy / d) * force;
          }
        }

        // Damping
        n.vx *= 0.94;
        n.vy *= 0.94;

        // Soft bounds
        if (n.x < 0) { n.x = 0; n.vx *= -0.5; }
        if (n.x > w) { n.x = w; n.vx *= -0.5; }
        if (n.y < 0) { n.y = 0; n.vy *= -0.5; }
        if (n.y > h) { n.y = h; n.vy *= -0.5; }
      }

      // Inter-node web
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINE_RADIUS_SQ) {
            const alpha = (1 - d2 / LINE_RADIUS_SQ) * 0.4;
            ctx.strokeStyle = `hsla(184, 100%, 60%, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Cursor → node lines (highlight web around cursor)
      if (mouse.active) {
        for (const n of nodes) {
          const dx = n.x - smoothMouse.x;
          const dy = n.y - smoothMouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < CURSOR_LINK_RADIUS_SQ) {
            const alpha = (1 - d2 / CURSOR_LINK_RADIUS_SQ) * 0.7;
            ctx.strokeStyle = `hsla(184, 100%, 70%, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(smoothMouse.x, smoothMouse.y);
            ctx.lineTo(n.x, n.y);
            ctx.stroke();
          }
        }

        // Cursor pulse halo
        const pulse = (Math.sin(t * 0.08) + 1) * 0.5;
        ctx.strokeStyle = `hsla(184, 100%, 65%, ${0.15 + pulse * 0.15})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(smoothMouse.x, smoothMouse.y, 24 + pulse * 6, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw nodes on top
      for (const n of nodes) {
        ctx.fillStyle = "hsla(184, 100%, 70%, 0.9)";
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("touchmove", onTouch);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 h-full w-full"
      aria-hidden="true"
    />
  );
};
