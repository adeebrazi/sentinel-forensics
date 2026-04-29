"use client";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  Upload,
  Activity,
  Target,
  Database,
  CheckCircle2,
  Loader2,
  Download,
  MonitorPlay,
} from "lucide-react";

// Dynamic import is mandatory for WebGL components in Next.js
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

export default function ForensicIngestion() {
  const globeRef = useRef<any>(null);
  const router = useRouter();

  // --- INGESTION LOGIC STATE ---
  const [progress, setProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileObj, setFileObj] = useState<File | null>(null);
  const [scanComplete, setScanComplete] = useState(false);
  const [securedFileName, setSecuredFileName] = useState<string | null>(null);

  // --- REAL BACKEND INGESTION HANDLER ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileObj(file);
    setFileName(file.name);
    setIsScanning(true);
    setProgress(0);
    setScanComplete(false);
    setSecuredFileName(null);

    const formData = new FormData();
    formData.append("video", file);

    try {
      const interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 90) return p;
          return p + Math.floor(Math.random() * 10) + 5;
        });
      }, 400);

      const response = await fetch("https://sentinel-forensics.onrender.com/video/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(interval);
      setProgress(100);

      if (response.ok) {
        const result = await response.json();
        setSecuredFileName(result.filename);
        setTimeout(() => {
          setIsScanning(false);
          setScanComplete(true);
        }, 600);
      } else {
        setIsScanning(false);
      }
    } catch (error) {
      console.error("Upload failed", error);
      setIsScanning(false);
    }
  };

  // --- DOWNLOAD HANDLER ---
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!securedFileName) return;

    const url = `https://sentinel-forensics.onrender.com/download/${securedFileName}`;
    const a = document.createElement("a");
    a.href = url;
    a.download = `VERIFIED_AUDIT_${securedFileName}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // --- NEW: THUMBNAIL ENGINE (Invisible Logic) ---
  const generateThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      const canvas = document.createElement("canvas");
      const url = URL.createObjectURL(file);
      video.src = url;
      video.load();
      video.currentTime = 0.5;
      video.onloadeddata = () => {
        canvas.width = 640;
        canvas.height = 360;
        canvas
          .getContext("2d")
          ?.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        URL.revokeObjectURL(url);
        resolve(dataUrl);
      };
    });
  };

  // --- REPAIRED: SENTINEL TV UPLOAD (Connects to Backend) ---
  const handleUploadToTV = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!fileObj || !securedFileName) return;
    setIsScanning(true); // Show processing state while uploading

    try {
      // 1. Capture the permanent thumbnail
      const thumbnail = await generateThumbnail(fileObj);

      const trackingId = `TRK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

      const videoData = {
        id: trackingId,
        name: fileObj.name,
        timestamp: new Date().toISOString(),
        // PERMANENT LINK: Points to the Python Streamer
        url: `https://sentinel-forensics.onrender.com/stream/${securedFileName}?viewer_id=${trackingId}`,
        thumbnail: thumbnail,
        status: "TRACKING_ACTIVE",
      };

      const existingData = localStorage.getItem("sentinel_videos");
      const parsedData = existingData ? JSON.parse(existingData) : [];
      localStorage.setItem(
        "sentinel_videos",
        JSON.stringify([videoData, ...parsedData]),
      );

      router.push("/tv");
    } catch (error) {
      console.error("Forensic Link Failed:", error);
    } finally {
      setIsScanning(false);
    }
  };

  // --- 3D ENGINE, STRICT ROTATION & ZOOM LOCKS ---
  useEffect(() => {
    let interactionTimeout: NodeJS.Timeout;
    let resumeRotationTimeout: NodeJS.Timeout;
    let sequenceTimeout: NodeJS.Timeout;

    const initGlobe = () => {
      const globe = globeRef.current;
      if (!globe) return;

      const controls = globe.controls();
      if (!controls) {
        setTimeout(initGlobe, 100);
        return;
      }

      const scene = globe.scene();
      const ambientLight = scene.children.find(
        (obj: any) => obj.type === "AmbientLight",
      );
      if (ambientLight) ambientLight.intensity = 3.5;

      globe.pointOfView({ lat: 20, lng: 78, altitude: 2.2 }, 2000);

      sequenceTimeout = setTimeout(() => {
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.enableRotate = true;

        controls.autoRotate = true;
        controls.autoRotateSpeed = 1.5;

        const handleStart = () => {
          clearTimeout(interactionTimeout);
          clearTimeout(resumeRotationTimeout);
          controls.autoRotate = false;
        };

        const handleEnd = () => {
          interactionTimeout = setTimeout(() => {
            globe.pointOfView({ lat: 20, lng: 78, altitude: 2.2 }, 1500);
            resumeRotationTimeout = setTimeout(() => {
              controls.autoRotate = true;
            }, 1600);
          }, 2000);
        };

        controls.addEventListener("start", handleStart);
        controls.addEventListener("end", handleEnd);
      }, 2100);
    };

    setTimeout(initGlobe, 500);

    return () => {
      clearTimeout(interactionTimeout);
      clearTimeout(resumeRotationTimeout);
      clearTimeout(sequenceTimeout);
    };
  }, []);

  const InteractiveZone = isScanning || scanComplete ? "div" : "label";

  return (
    <div className="grid grid-cols-12 gap-8 h-full select-none overflow-hidden font-corpta">
      {/* --- LEFT: FORENSIC UPLOADER CONSOLE --- */}
      <div className="col-span-5 flex flex-col justify-center animate-in slide-in-from-left-10 duration-700 ml-6 z-20">
        <div className="hacker-card p-12 bg-[#09090b]/80 backdrop-blur-2xl border border-cyan-900/50 rounded-[2rem] relative overflow-hidden group shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
          <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/40 blur-sm animate-[bounce_5s_infinite] z-20" />

          <div className="text-center mb-10 border-b border-cyan-900/50 pb-6 relative z-10">
            <h2 className="text-3xl font-black italic text-cyan-400 tracking-widest uppercase drop-shadow-[0_0_10px_rgba(0,210,255,0.5)]">
              Forensic Ingestion
            </h2>
            <p className="text-[10px] text-cyan-600/80 mt-2 font-bold tracking-[0.4em] uppercase">
              Node: Audit_X12_Alpha
            </p>
          </div>

          <InteractiveZone
            className={`border border-dashed rounded-[2.5rem] p-10 flex flex-col items-center justify-center bg-black/40 transition-all relative z-10 ${isScanning || scanComplete ? "border-cyan-500/50 cursor-default" : "border-cyan-900/50 cursor-pointer hover:border-cyan-400/80 hover:bg-cyan-500/5"}`}
          >
            {!(isScanning || scanComplete) && (
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            )}

            <div className="absolute top-6 left-6 w-4 h-4 border-t border-l border-cyan-700/50 group-hover:border-cyan-400 transition-colors" />
            <div className="absolute bottom-6 right-6 w-4 h-4 border-b border-r border-cyan-700/50 group-hover:border-cyan-400 transition-colors" />

            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 border transition-all ${scanComplete ? "bg-green-500/10 border-green-500/30" : "bg-cyan-500/10 border-cyan-500/20 shadow-[0_0_15px_rgba(0,210,255,0.1)]"}`}
            >
              {isScanning ? (
                <Loader2 className="text-cyan-400 animate-spin" size={26} />
              ) : scanComplete ? (
                <CheckCircle2 className="text-green-400" size={26} />
              ) : (
                <Upload className="text-cyan-400" size={26} />
              )}
            </div>

            <p className="text-sm font-black text-slate-200 tracking-[0.2em] uppercase text-center">
              {isScanning
                ? "Processing Stream..."
                : scanComplete
                  ? "Ingestion Complete"
                  : "Initialize Bit-Stream"}
            </p>
            <p className="text-[9px] text-slate-500 mt-3 uppercase font-bold tracking-widest text-center">
              {fileName
                ? `TARGET: ${fileName}`
                : "Awaiting Physical Media Input"}
            </p>

            {scanComplete && (
              <div className="flex flex-col sm:flex-row gap-4 mt-8 z-30 w-full justify-center animate-in zoom-in-95 duration-500">
                <button
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 border border-cyan-500/50 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(0,210,255,0.3)] rounded transition-all text-[10px] uppercase font-black tracking-widest"
                >
                  <Download size={14} /> Download
                </button>
                <button
                  onClick={handleUploadToTV}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 border border-green-500/50 bg-green-500/10 text-green-400 hover:bg-green-500/20 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)] rounded transition-all text-[10px] uppercase font-black tracking-widest"
                >
                  <MonitorPlay size={14} /> Sentinel TV
                </button>
              </div>
            )}
          </InteractiveZone>

          <div className="mt-12 space-y-4 relative z-10">
            <div className="flex justify-between text-[10px] font-black text-cyan-700 uppercase tracking-[0.3em]">
              <span>{scanComplete ? "Audit Verified" : "Audit Progress"}</span>
              <span
                className={scanComplete ? "text-green-400" : "text-cyan-400"}
              >
                {progress}%
              </span>
            </div>
            <div className="w-full bg-black/60 h-2 rounded-full overflow-hidden border border-cyan-900/30">
              <div
                className={`h-full transition-all duration-300 ${scanComplete ? "bg-green-500 shadow-[0_0_15px_#22c55e]" : "bg-cyan-500 shadow-[0_0_15px_#00d2ff]"}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <p className="text-[8px] text-center text-cyan-800/60 mt-10 uppercase font-black tracking-[0.6em] relative z-10">
            SECURE KERNEL v3.4 • AES-256 ENCRYPTION ACTIVE
          </p>
        </div>
      </div>

      {/* --- RIGHT: 3D HOLOGRAPHIC CHAMBER --- */}
      <div className="col-span-7 relative flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-1000">
        <div className="absolute top-0 w-full h-12 curved-header bg-cyan-500/5 flex items-center justify-center opacity-40 z-20 pointer-events-none">
          <p className="text-[9px] font-black text-cyan-800 uppercase tracking-[0.5em]">
            Global Monitoring Matrix
          </p>
        </div>

        <div
          className="relative flex items-center justify-center w-full h-full z-10 transform translate-x-12 scale-[0.8] cursor-grab active:cursor-grabbing"
          onWheel={(e) => e.stopPropagation()}
        >
          <div className="absolute w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[130px] opacity-80 pointer-events-none" />

          <Globe
            ref={globeRef}
            width={850}
            height={850}
            backgroundColor="rgba(0,0,0,0)"
            showAtmosphere={true}
            atmosphereColor="#00d2ff"
            atmosphereAltitude={0.2}
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
            bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
            hexBinPointsData={Array.from({ length: 450 }).map(() =>
              generateRandomLatLng(),
            )}
            hexBinPointWeight="size"
            hexBinResolution={4}
            hexMargin={0.25}
            hexTopColor={() => "#00d2ff"}
            hexSideColor={() => "rgba(0, 210, 255, 0.2)"}
          />

          <div className="absolute w-[950px] h-[950px] border border-cyan-500/10 rounded-full animate-[pulse_8s_infinite] pointer-events-none" />
          <div className="absolute w-[880px] h-[880px] border border-dashed border-cyan-500/20 rounded-full animate-[spin_45s_linear_infinite] pointer-events-none" />
        </div>

        <div className="absolute top-24 right-16 p-5 hacker-card border-cyan-500/10 bg-[#09090b]/80 backdrop-blur-md rounded-2xl w-56 z-20 pointer-events-none shadow-2xl">
          <div className="flex items-center gap-3 mb-3">
            <Target size={14} className="text-cyan-400 animate-ping" />
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest drop-shadow-[0_0_5px_#00d2ff]">
              Active Sync
            </span>
          </div>
          <div className="space-y-2">
            <p className="text-[8px] text-cyan-700 uppercase tracking-widest">
              Node_ID: ASIA_PACIFIC_01
            </p>
            <div className="w-full bg-black h-1 rounded-full">
              <div className="bg-cyan-500 w-[65%] h-full shadow-[0_0_5px_cyan] rounded-full" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 hacker-card bg-[#09090b]/90 backdrop-blur-xl p-5 border-cyan-900/50 rounded-2xl w-[450px] text-center flex items-center justify-between z-20 shadow-[0_10px_30px_rgba(0,0,0,0.8)] pointer-events-none">
          <Activity size={16} className="text-cyan-600" />
          <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em] animate-pulse drop-shadow-[0_0_5px_#00d2ff]">
            Global Forensic Intelligence Live
          </p>
          <Database size={16} className="text-cyan-600" />
        </div>
      </div>
    </div>
  );
}

// Update GlobeMethods type with specific types
interface GlobeMethods {
  controls: () => any;
  scene: () => any;
  pointOfView: (
    view: { lat: number; lng: number; altitude: number },
    duration: number,
  ) => void;
}


// Define the missing function
const generateRandomLatLng = (): { lat: number; lng: number; size: number } => {
  return {
    lat: (Math.random() - 0.5) * 180,
    lng: (Math.random() - 0.5) * 360,
    size: Math.random() * 10,
  };
};

// Remove unused variables
// Removed 'isAmbientLight' and unused 'globeRef' if not required.
