"use client";
import { useState, useEffect } from "react";
import { useGoogleLogin, googleLogout } from "@react-oauth/google";
import { Play, User, Search, Bell, Menu, MonitorPlay, X, LogOut, Download, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface TrackedVideo {
  id: string;
  name: string;
  timestamp: string;
  url: string;
  thumbnail: string;
}

const VideoSkeleton = () => (
  <div className="flex flex-col gap-3 animate-pulse">
    <div className="w-full aspect-video bg-zinc-800/50 rounded-2xl" />
    <div className="flex gap-3 mt-1">
      <div className="w-10 h-10 rounded-full bg-zinc-800/50 flex-shrink-0" />
      <div className="flex-1 space-y-2 mt-1">
        <div className="h-4 bg-zinc-800/50 rounded w-full" />
        <div className="h-3 bg-zinc-800/50 rounded w-2/3" />
      </div>
    </div>
  </div>
);

export default function SentinelTV() {
  const [videos, setVideos] = useState<TrackedVideo[]>([]);
  const [playingVideo, setPlayingVideo] = useState<TrackedVideo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const data = await res.json();
        setUserProfile(data);
      } catch (err) {
        console.error("Failed to fetch user profile", err);
      }
    },
  });

  useEffect(() => {
    const data = localStorage.getItem("sentinel_videos");
    if (data) {
      const parsedData = JSON.parse(data);
      setTimeout(() => {
        setVideos(parsedData);
        setIsLoading(false);
      }, 1500);
    } else {
      setIsLoading(false);
    }
  }, []);

  // Format the date dynamically
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="flex flex-col h-full font-sans bg-[#0f0f11] text-zinc-100 overflow-hidden w-full">
      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-4 sticky top-0 bg-[#0f0f11]/90 backdrop-blur-xl z-40 border-b border-white/5">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="relative w-8 h-8 flex items-center justify-center overflow-hidden">
              <Image 
                src="/sentinel tv.png" 
                alt="Sentinel TV Logo" 
                fill
                className="object-contain"
              />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Sentinel TV</h1>
          </div>
        </div>

        <div className="flex-1 max-w-2xl px-8 flex justify-center">
          <div className="flex w-full max-w-xl items-center bg-zinc-900 border border-zinc-800 rounded-full focus-within:border-zinc-600 focus-within:bg-zinc-900/50 transition-colors overflow-hidden">
            <div className="pl-5 pr-3 text-zinc-500">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search videos..."
              className="w-full bg-transparent border-none py-2.5 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-0"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/about">
            <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-full hover:bg-zinc-800 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider hidden sm:flex">
              <Users size={14} /> Know the Team
            </button>
          </Link>
          {userProfile ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-300 font-medium">{userProfile.name}</span>
              {userProfile.picture ? (
                <Image src={userProfile.picture} alt="Profile" width={32} height={32} className="rounded-full border border-zinc-700" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                  <User size={16} className="text-zinc-400" />
                </div>
              )}
              <button 
                onClick={() => {
                  googleLogout();
                  setUserProfile(null);
                }}
                className="ml-1 p-2 rounded-full hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-colors"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => login()}
              className="ml-2 flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/5 px-4 py-2 rounded-full transition-colors"
            >
              <User size={18} className="text-zinc-200" />
              <span className="text-sm font-medium">Sign In</span>
            </button>
          )}
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        {playingVideo ? (
          <div className="flex flex-col lg:flex-row gap-6 p-6 lg:p-8 max-w-[1800px] mx-auto animate-in fade-in duration-500">
            {/* LEFT COLUMN: PLAYER */}
            <div className="flex-1 lg:max-w-[72%]">
              <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl relative border border-white/5">
                <video
                  key={playingVideo.url}
                  src={playingVideo.url}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="mt-4 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">{playingVideo.name.replace('.mp4', '').replace('.MP4', '')}</h2>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      SF
                    </div>
                    <div className="flex flex-col">
                      <span className="text-zinc-200 font-semibold text-sm">Sentinel Forensics</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPlayingVideo(null)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <X size={16} /> Close Player
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: UP NEXT */}
            <div className="w-full lg:w-[28%] flex flex-col gap-4">
              <h3 className="text-lg font-bold text-white mb-1">Up next</h3>
              {videos.filter(v => v.id !== playingVideo.id).map((video) => (
                <div
                  key={video.id}
                  className="group cursor-pointer flex gap-3 items-start"
                  onClick={() => setPlayingVideo(video)}
                >
                  <div className="relative w-40 aspect-video rounded-xl overflow-hidden bg-zinc-900 flex-shrink-0">
                    {video.thumbnail ? (
                      <Image
                         src={video.thumbnail}
                         fill
                         className="object-cover transition-transform duration-500 group-hover:scale-105"
                         alt="Thumbnail"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                        <MonitorPlay className="text-zinc-700" size={20} />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition-all">
                      <Play className="text-white fill-white" size={20} />
                    </div>
                  </div>
                  <div className="flex flex-col py-0.5">
                    <h4 className="text-sm font-semibold text-zinc-100 line-clamp-2 leading-tight group-hover:text-white transition-colors">
                      {video.name.replace('.mp4', '').replace('.MP4', '')}
                    </h4>
                    <span className="text-xs text-zinc-400 mt-1">Sentinel Forensics</span>
                    <span className="text-xs text-zinc-400">{formatDate(video.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="px-8 py-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
              {isLoading
                ? [...Array(10)].map((_, i) => <VideoSkeleton key={i} />)
                : videos.map((video) => (
                    <div
                      key={video.id}
                      className="group cursor-pointer flex flex-col gap-3"
                      onClick={() => setPlayingVideo(video)}
                    >
                      <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-900 transition-all duration-300 group-hover:rounded-xl">
                        {video.thumbnail ? (
                          <Image
                             src={video.thumbnail}
                             fill
                             className="object-cover transition-transform duration-500 group-hover:scale-105"
                             alt="Thumbnail"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                            <MonitorPlay className="text-zinc-700" size={32} />
                          </div>
                        )}
                        
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition-all duration-300">
                          <div className="bg-white/20 backdrop-blur-md p-3 rounded-full transform scale-90 group-hover:scale-100 transition-transform">
                            <Play className="text-white fill-white" size={24} />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 px-1">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center text-white font-bold text-xs shadow-lg flex-shrink-0">
                          SF
                        </div>
                        <div className="flex flex-col">
                          <h3 className="text-[15px] font-semibold text-zinc-100 line-clamp-2 leading-snug group-hover:text-white transition-colors">
                            {video.name.replace('.mp4', '').replace('.MP4', '')}
                          </h3>
                          <div className="text-[13px] text-zinc-400 mt-1 flex items-center gap-1.5">
                            <span>Sentinel Forensics</span>
                            <span className="text-[10px] opacity-50">•</span>
                            <span>{formatDate(video.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
