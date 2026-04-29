"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Fingerprint, History, RefreshCw } from "lucide-react";
import { XCircle, Upload, ShieldCheck, LinkIcon, Search, MonitorPlay } from "lucide-react";
import Link from "next/link";

// Define the missing type
export interface LeakRecord {
  leaker_id: string;
  source: string;
  detected_at: string;
  filename: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total_secured: 0, total_leaks: 0 });
  const [recentLeaks, setRecentLeaks] = useState<LeakRecord[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);


  
  const [urlAuditResult, setUrlAuditResult] = useState<{
    status: string;
    id: string;
  } | null>(null);
  
  const [urlInput, setUrlInput] = useState("");
  const [isUrlScanning, setIsUrlScanning] = useState(false);

  const [fileAuditResult, setFileAuditResult] = useState<{
    status: string;
    id: string;
  } | null>(null);
  const [isFileScanning, setIsFileScanning] = useState(false);

  useEffect(() => {
    // Client-side route guard (No flashing!)
    const role = localStorage.getItem("userRole");
    if (role === "admin") {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchAnalytics();
    // Intentionally empty dependency array to only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAnalytics = async () => {
    setIsUpdating(true);
    try {
      // Artificial delay to make the sync feel substantial and cool
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      const response = await fetch("https://sentinel-forensics.onrender.com/admin/dashboard");
      if (response.ok) {
        const data = await response.json();
        setStats({
          total_secured: data.total_secured,
          total_leaks: data.total_leaks,
        });
        setRecentLeaks(data.recent_leaks);
        setLastSync(new Date()); // Update the visual clock!
      }
    } catch {
      alert("Forensic Link Offline");
    } finally {
      setIsUpdating(false);
    }
  };



  const handleUrlAudit = async () => {
    if (!urlInput) return;
    setIsUrlScanning(true);
    setUrlAuditResult(null);

    try {
      const response = await fetch("https://sentinel-forensics.onrender.com/video/audit-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: urlInput }),
      });

      if (response.ok) {
        const result = await response.json();
        setUrlAuditResult({ status: result.status, id: result.extracted_id });
        fetchAnalytics();
      }
    } catch {
      alert("Forensic Link Offline");
    } finally {
      setIsUrlScanning(false);
      setUrlInput("");
    }
  };

  const handleFileAudit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsFileScanning(true);
    setFileAuditResult(null);

    const formData = new FormData();
    formData.append("video", file);

    try {
      const response = await fetch("https://sentinel-forensics.onrender.com/video/audit", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setFileAuditResult({ status: result.status, id: result.extracted_id });
        fetchAnalytics();
      }
    } catch {
      alert("Forensic Link Offline");
    } finally {
      setIsFileScanning(false);
      e.target.value = '';
    }
  };

  useEffect(() => {
    fetchAnalytics();
    setMounted(true);
  }, []);

  if (isAuthorized === false) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-black/50 p-8 text-center animate-in fade-in zoom-in duration-500">
        <ShieldAlert className="text-red-600 animate-pulse" size={80} />
        <h1 className="font-display text-4xl font-black tracking-widest text-red-500">
          UNAUTHORIZED ACCESS
        </h1>
        <p className="font-mono-tech text-sm tracking-widest text-red-500/70">
          YOUR CREDENTIALS DO NOT HAVE CLEARANCE FOR THE COMMAND CENTER.
        </p>
      </div>
    );
  }

  // Prevents hydration flashing and waits for auth check
  if (!mounted || isAuthorized === null) return null;

  return (
    <div className="flex flex-col h-full font-corpta animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
            <ShieldAlert className="text-red-500" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black italic text-white tracking-wider uppercase">
              Forensic Command Center
            </h1>
            <p className="text-[10px] text-cyan-800 tracking-[0.5em] font-bold uppercase">
              Authorized_Personnel_Only
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin/videos">
            <button className="flex items-center gap-2 px-6 py-2 border border-red-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition-all">
              <MonitorPlay size={14} /> Network Video Control
            </button>
          </Link>
          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-2 px-6 py-2 border border-cyan-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-cyan-400 hover:bg-cyan-500/10 transition-all"
          >
            <RefreshCw size={14} className={isUpdating ? "animate-spin" : ""} />{" "}
            Sync Intelligence
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 flex-1 overflow-hidden">
        {/* LEFT PANEL */}
        <div className="col-span-4 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2 pb-4">

          {/* OFFLINE MEDIA SCANNER */}
          <div className="hacker-card p-6 bg-[#09090b]/90 border border-cyan-500/30 rounded-[2rem] relative flex flex-col overflow-hidden shadow-[0_0_30px_rgba(0,210,255,0.05)] shrink-0">
            {isFileScanning && (
               <div className="absolute left-0 right-0 h-1 bg-cyan-400/50 blur-sm animate-[scan-sweep_2s_linear_infinite]" />
            )}
            <div className="flex items-center gap-3 text-cyan-400 font-black uppercase text-[11px] tracking-[0.3em] mb-4">
              <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                <Upload size={16} />
              </div>
              Offline Media Scanner
            </div>
            
            {fileAuditResult ? (
              <div
                className={`p-6 rounded-xl border animate-in zoom-in-95 duration-300 flex flex-col items-center justify-center text-center ${fileAuditResult.status === "authorized" ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}`}
              >
                <div className="flex w-full items-start justify-end mb-1">
                  <button onClick={() => setFileAuditResult(null)} className="opacity-50 hover:opacity-100">
                    <XCircle size={14} className="text-white" />
                  </button>
                </div>
                {fileAuditResult.status === "authorized" ? (
                  <ShieldCheck size={24} className="text-green-400 mb-2" />
                ) : (
                  <ShieldAlert size={24} className="text-red-500 mb-2 animate-pulse" />
                )}
                <span className={`text-[11px] font-black tracking-[0.2em] uppercase ${fileAuditResult.status === "authorized" ? "text-green-400" : "text-red-500"}`}>
                  {fileAuditResult.status === "authorized" ? "VERIFIED SECURE" : "BREACH DETECTED"}
                </span>
                <p className="text-md text-white font-black font-mono mt-2 break-all">
                  {fileAuditResult.id}
                </p>
              </div>
            ) : (
              <label className={`w-full flex flex-col items-center justify-center py-10 px-6 border border-dashed rounded-xl transition-all ${isFileScanning ? "border-cyan-500/50 cursor-default" : "border-cyan-900/50 cursor-pointer hover:border-cyan-400/50 hover:bg-cyan-500/5"}`}>
                <input type="file" accept="video/*" className="hidden" onChange={handleFileAudit} disabled={isFileScanning} />
                {isFileScanning ? (
                  <RefreshCw size={20} className="text-cyan-400 animate-spin mb-3" />
                ) : (
                  <Upload size={20} className="text-cyan-700 mb-3" />
                )}
                <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest text-center">
                  {isFileScanning ? "Processing Byte-Stream..." : "Audit Local File (e.g. WhatsApp)"}
                </span>
              </label>
            )}
          </div>

          {/* ONLINE LINK AUDIT - ADVANCED */}
          <div className="hacker-card p-6 bg-[#09090b]/90 border border-cyan-500/30 rounded-[2rem] flex flex-col relative overflow-hidden shadow-[0_0_30px_rgba(0,210,255,0.05)] shrink-0">
            {/* Background scanning effect */}
            {isUrlScanning && (
               <div className="absolute left-0 right-0 h-1 bg-cyan-400/50 blur-sm animate-[scan-sweep_2s_linear_infinite]" />
            )}

            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3 text-cyan-400 font-black uppercase text-[11px] tracking-[0.3em]">
                <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                  <LinkIcon size={16} />
                </div>
                Deep-Link URL Audit
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[8px] text-green-500 font-black tracking-widest uppercase">Node_Online</span>
              </div>
            </div>
            
            {urlAuditResult && (
              <div
                className={`p-5 rounded-2xl border animate-in zoom-in-95 duration-300 mb-8 flex-1 flex flex-col justify-center items-center text-center ${urlAuditResult.status === "authorized" ? "bg-green-500/10 border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.1)]" : "bg-red-500/10 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.1)]"}`}
              >
                <div className="flex w-full items-start justify-end mb-2">
                  <button onClick={() => setUrlAuditResult(null)} className="opacity-50 hover:opacity-100 transition-opacity">
                    <XCircle size={16} className="text-white" />
                  </button>
                </div>
                
                {urlAuditResult.status === "authorized" ? (
                  <ShieldCheck size={48} className="text-green-400 mb-4" />
                ) : (
                  <ShieldAlert size={48} className="text-red-500 mb-4 animate-pulse" />
                )}

                <span
                  className={`text-[14px] font-black tracking-[0.3em] uppercase mb-2 ${urlAuditResult.status === "authorized" ? "text-green-400" : "text-red-500"}`}
                >
                  {urlAuditResult.status === "authorized"
                    ? "VERIFIED SECURE"
                    : "BREACH DETECTED"}
                </span>
                <p className="text-[10px] text-white/50 font-bold tracking-widest uppercase">
                  Target_ID:
                </p>
                <p className="text-lg text-white font-black font-mono mt-1 break-all px-4">
                  {urlAuditResult.id}
                </p>
              </div>
            )}
            
            <div className={`mt-auto ${urlAuditResult ? 'hidden' : 'block'}`}>
              <div className="space-y-4">
                <div className="flex justify-between text-[9px] font-black text-cyan-700 tracking-[0.2em] uppercase px-1">
                  <span>Enter Sentinel TV Stream Link</span>
                  <span>AES-256</span>
                </div>
                <div className="relative group">
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleUrlAudit()}
                    disabled={isUrlScanning}
                    placeholder="HTTP://..."
                    className="w-full bg-black/80 border border-cyan-900/60 rounded-xl px-5 py-4 text-[11px] text-cyan-300 placeholder:text-cyan-900 focus:outline-none focus:border-cyan-400/50 focus:bg-cyan-950/20 uppercase tracking-widest font-mono transition-all"
                  />
                  <button 
                    onClick={handleUrlAudit}
                    disabled={isUrlScanning || !urlInput}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-cyan-500/10 text-cyan-400 rounded-lg hover:bg-cyan-500/20 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {isUrlScanning ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
                  </button>
                </div>
                
                <div className="flex items-center gap-2 text-[8px] text-cyan-800 font-bold uppercase tracking-widest mt-4">
                  <ShieldCheck size={10} /> Active Packet Inspection Engine v2.1
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: REGISTRY */}
        <div className="col-span-8 flex flex-col hacker-card bg-[#09090b]/80 border border-cyan-900/50 rounded-[2rem] overflow-hidden">
          <div className="p-8 border-b border-cyan-900/30 flex items-center justify-between bg-cyan-500/5">
            <div className="flex items-center gap-3">
              <History className="text-cyan-500" size={18} />
              <span className="text-[11px] font-black text-white uppercase tracking-[0.3em]">
                Breach Incident Registry
              </span>
            </div>
            <span className="text-[9px] text-cyan-900 font-bold uppercase">
              Last_Sync:{" "}
              {lastSync ? lastSync.toLocaleTimeString() : "--:--:--"}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-black/20">
            <table className="w-full text-left border-separate border-spacing-y-3">
              <thead>
                <tr className="text-[9px] font-black text-cyan-800 uppercase tracking-widest">
                  <th className="px-6 pb-2">Target ID</th>
                  <th className="px-6 pb-2">Origin Source</th>
                  <th className="px-6 pb-2">Timestamp</th>
                  <th className="px-6 pb-2">File Signature</th>
                </tr>
              </thead>
              <tbody>
                {recentLeaks.map((leak, i) => (
                  <tr key={i} className="group transition-all">
                    <td className="px-6 py-4 bg-black/40 border-y border-l border-red-950/30 rounded-l-2xl group-hover:border-red-500/40">
                      <span className="text-[10px] font-black text-red-500 tracking-tighter uppercase">
                        {leak.leaker_id}
                      </span>
                    </td>
                    <td className="px-6 py-4 bg-black/40 border-y border-red-950/30">
                      <span className="text-[10px] font-bold text-white uppercase opacity-80">
                        {leak.source}
                      </span>
                    </td>
                    <td className="px-6 py-4 bg-black/40 border-y border-red-950/30 text-[9px] font-bold text-cyan-900 uppercase">
                      {mounted
                        ? new Date(leak.detected_at).toLocaleString()
                        : ""}
                    </td>
                    <td className="px-6 py-4 bg-black/40 border-y border-r border-red-950/30 rounded-r-2xl text-[9px] font-mono text-cyan-700 italic truncate w-32">
                      {leak.filename}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
