"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash2, MonitorPlay, ArrowLeft, ShieldAlert } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface TrackedVideo {
  id: string;
  name: string;
  timestamp: string;
  url: string;
  thumbnail: string;
}

export default function AdminVideoManager() {
  const [videos, setVideos] = useState<TrackedVideo[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role === "admin") {
      setIsAuthorized(true);
      const data = localStorage.getItem("sentinel_videos");
      if (data) {
        setVideos(JSON.parse(data));
      }
    } else {
      setIsAuthorized(false);
    }
    setMounted(true);
  }, []);

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to completely scrub this video from the Sentinel TV network?")) return;
    
    const updatedVideos = videos.filter(v => v.id !== id);
    setVideos(updatedVideos);
    localStorage.setItem("sentinel_videos", JSON.stringify(updatedVideos));
  };

  if (!mounted || isAuthorized === null) return null;

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

  return (
    <div className="flex flex-col h-full font-corpta animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-6">
          <Link href="/admin">
            <button className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20 hover:bg-cyan-500/20 transition-all group">
              <ArrowLeft className="text-cyan-400 group-hover:-translate-x-1 transition-transform" size={24} />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-black italic text-white tracking-wider uppercase">
              Network Video Management
            </h1>
            <p className="text-[10px] text-cyan-800 tracking-[0.5em] font-bold uppercase">
              Sentinel_TV_Content_Control
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hacker-card bg-[#09090b]/80 border border-cyan-900/50 rounded-[2rem] p-8 custom-scrollbar">
        {videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-cyan-900 opacity-50">
            <MonitorPlay size={64} className="mb-4" />
            <p className="font-black uppercase tracking-widest">No active bit-streams on the network.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {videos.map((video) => (
              <div key={video.id} className="bg-black/50 border border-cyan-900/30 rounded-2xl overflow-hidden group flex flex-col">
                <div className="relative aspect-video bg-zinc-900">
                  {video.thumbnail ? (
                    <Image
                      src={video.thumbnail}
                      layout="fill"
                      objectFit="cover"
                      alt="Thumbnail"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MonitorPlay className="text-zinc-700" size={32} />
                    </div>
                  )}
                  {/* Delete Button Overlay */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button 
                      onClick={() => handleDelete(video.id)}
                      className="p-2 bg-red-600/90 hover:bg-red-500 text-white rounded-lg shadow-lg border border-red-400/50 transition-all hover:scale-105"
                      title="Scrub from Network"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-sm font-bold text-white line-clamp-1 uppercase tracking-wider mb-1">
                    {video.name.replace('.mp4', '').replace('.MP4', '')}
                  </h3>
                  <div className="mt-auto">
                    <p className="text-[10px] font-black text-cyan-700 tracking-widest">
                      ID: {video.id}
                    </p>
                    <p className="text-[9px] text-cyan-900 font-bold tracking-widest mt-1">
                      {new Date(video.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
