import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight, List, AlertCircle, Play, Shield, ShieldAlert, RefreshCw, Sword } from 'lucide-react'; // Added Sword

const API_URL = 'https://saint-immortal.vercel.app';

export default function WatchEpisode() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  // Player State
  const [servers, setServers] = useState([]);
  const [currentServer, setCurrentServer] = useState(null);
  const [videoLoading, setVideoLoading] = useState(true);
  const [adBlockEnabled, setAdBlockEnabled] = useState(true);
  
  // Navigation State
  const [episodeList, setEpisodeList] = useState([]);
  const [animeName, setAnimeName] = useState("");
  const [navLoading, setNavLoading] = useState(true);

  // 1. Fetch Episode List (Sorted)
  useEffect(() => {
    setNavLoading(true);
    axios.get(`${API_URL}/episode/${slug}`)
      .then(res => {
        const result = res.data.result || {};
        setAnimeName(result.name);
        
        // Update Browser Tab Title
        document.title = result.name ? `Watching ${result.name}` : "Watch Anime";

        if (result.episode && result.episode.length > 0) {
            // Sort episodes descending (Newest first)
            const sorted = [...result.episode].sort((a, b) => {
                const numA = parseFloat(a.episode.replace(/[^0-9.]/g, '')) || 0;
                const numB = parseFloat(b.episode.replace(/[^0-9.]/g, '')) || 0;
                return numB - numA;
            });
            setEpisodeList(sorted);
        }
        setNavLoading(false);
      })
      .catch(err => {
        console.error("Nav Error:", err);
        setNavLoading(false);
      });
  }, [slug]);

  // 2. Fetch Video Sources
  useEffect(() => {
    setVideoLoading(true);
    setServers([]);
    setCurrentServer(null);
    setAdBlockEnabled(true);
    window.scrollTo(0, 0);

    axios.get(`${API_URL}/video-source/${slug}`)
      .then(res => {
        const data = res.data;
        if (data.medias && data.medias.length > 0) {
          setServers(data.medias);
          setCurrentServer(data.medias[0]);
        }
        setVideoLoading(false);
      })
      .catch(err => {
        console.error("Video Error:", err);
        setVideoLoading(false);
      });
  }, [slug]);

  // Navigation Logic
  const getNavLinks = () => {
    if (episodeList.length === 0) return { prev: null, next: null };
    const currentIndex = episodeList.findIndex(ep => ep.slug === slug);
    if (currentIndex === -1) return { prev: null, next: null };
    
    // List is Descending: Next is index-1, Prev is index+1
    return { 
        next: episodeList[currentIndex - 1], 
        prev: episodeList[currentIndex + 1] 
    };
  };

  const { prev, next } = getNavLinks();

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl text-gray-100">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <Link to="/" className="flex items-center text-gray-400 hover:text-white transition gap-2">
            <ChevronLeft className="w-5 h-5" /> Back to Home
        </Link>
        {animeName && <h1 className="font-bold text-lg hidden md:block text-blue-400 max-w-xl truncate">{animeName}</h1>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Player */}
        <div className="lg:col-span-2 space-y-4">
            
            {/* TOP CONTROL BAR (Prev/Next + AdBlock) */}
            <div className="flex flex-col sm:flex-row items-center justify-between bg-gray-800 p-3 rounded-xl border border-gray-700 gap-3">
                
                {/* NEW: Mini Prev/Next Buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                    <button 
                        onClick={() => prev && navigate(`/watch/${prev.slug}`)}
                        disabled={!prev}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                            prev 
                            ? 'bg-gray-700 hover:bg-gray-600 text-white cursor-pointer' 
                            : 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700'
                        }`}
                    >
                        <ChevronLeft className="w-4 h-4" /> Prev
                    </button>
                    
                    <span className="text-xs font-mono text-gray-500 font-bold px-2">
                        EP {slug.split('-').find(s => !isNaN(s) && s.length < 4) || "?"}
                    </span>

                    <button 
                        onClick={() => next && navigate(`/watch/${next.slug}`)}
                        disabled={!next}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                            next 
                            ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer' 
                            : 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700'
                        }`}
                    >
                        Next <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Ad-Block Controls */}
                {currentServer && (
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 text-xs">
                            {adBlockEnabled ? (
                                <span className="text-green-400 flex items-center gap-1"><Shield className="w-3 h-3" /> Safe</span>
                            ) : (
                                <span className="text-yellow-500 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Unsafe</span>
                            )}
                        </div>
                        <button 
                            onClick={() => setAdBlockEnabled(!adBlockEnabled)}
                            className={`text-xs px-3 py-1.5 rounded-full font-bold transition flex items-center gap-2 ${
                                adBlockEnabled 
                                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                                : 'bg-green-600 hover:bg-green-500 text-white'
                            }`}
                        >
                            {adBlockEnabled ? "Disable AdBlock" : "Enable AdBlock"}
                            {!adBlockEnabled && <RefreshCw className="w-3 h-3" />}
                        </button>
                    </div>
                )}
            </div>

            {/* Video Player */}
            <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-800 relative group">
                {videoLoading ? (
                    // --- NEW LOADING ANIMATION (Fit to Player) ---
                    <div className="flex flex-col items-center justify-center h-full w-full space-y-4 bg-gray-900">
                      <div className="relative">
                        <div className="absolute inset-0 w-16 h-16 border-4 border-blue-500/30 rounded-full animate-ping"></div>
                        <div className="absolute inset-0 w-16 h-16 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin"></div>
                        <div className="relative z-15 p-4 flex items-center justify-center">
                           <Sword className="w-7 h-7 text-blue-400 animate-sword " />
                        </div>
                      </div>
                      <p className="text-blue-400 text-xs font-bold tracking-widest animate-pulse">LOADING STREAM ...</p>
                    </div>
                    // ---------------------------------------------
                ) : currentServer ? (
                    <iframe 
                        key={`${currentServer.url}-${adBlockEnabled}`} 
                        src={currentServer.url}
                        className="w-full h-full"
                        allowFullScreen
                        scrolling="no"
                        title="Anime Player"
                        sandbox={adBlockEnabled ? "allow-scripts allow-same-origin allow-forms allow-presentation" : undefined}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                        <h3 className="text-xl font-bold">Video Not Available</h3>
                        <p className="text-gray-400 mt-2">No servers found for this episode.</p>
                    </div>
                )}
            </div>

            {/* Server Switcher */}
            {servers.length > 0 && (
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Source</h3>
                    <div className="flex flex-wrap gap-2">
                        {servers.map((srv, idx) => (
                            <button
                                key={idx}
                                onClick={() => { setCurrentServer(srv); setAdBlockEnabled(true); }}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                                    currentServer === srv 
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                                    : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                                }`}
                            >
                                <Play className="w-3 h-3" /> {srv.quality}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Bottom Nav Buttons (Kept as requested) */}
            <div className="flex justify-between items-center bg-gray-800 p-4 rounded-xl border border-gray-700">
                {prev ? (
                    <Link to={`/watch/${prev.slug}`} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition text-sm font-bold">
                        <ChevronLeft className="w-4 h-4" /> Ep {prev.episode}
                    </Link>
                ) : <div className="w-24"></div>}
                
                <span className="font-mono text-blue-400 font-bold text-lg hidden sm:block">
                    EPISODE {slug.split('-').find(s => !isNaN(s) && s.length < 4) || "CURRENT"}
                </span>

                {next ? (
                    <Link to={`/watch/${next.slug}`} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition text-sm font-bold">
                        Ep {next.episode} <ChevronRight className="w-4 h-4" />
                    </Link>
                ) : <div className="w-24"></div>}
            </div>
        </div>

        {/* RIGHT COLUMN: List */}
        <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl border border-gray-700 h-full max-h-[600px] flex flex-col">
                <div className="p-4 border-b border-gray-700 flex items-center gap-2 bg-gray-800/50">
                    <List className="w-5 h-5 text-blue-500" />
                    <h3 className="font-bold">Episodes</h3>
                </div>
                
                <div className="overflow-y-auto flex-1 p-2 space-y-1 custom-scrollbar">
                    {navLoading ? (
                        <div className="text-center py-10 text-gray-500">Loading...</div>
                    ) : episodeList.length > 0 ? (
                        episodeList.map((ep, i) => (
                            <Link 
                                key={i} 
                                to={`/watch/${ep.slug}`}
                                className={`block p-3 rounded-lg text-sm transition flex justify-between items-center group ${
                                    ep.slug === slug 
                                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                                    : 'hover:bg-gray-700 text-gray-300 border border-transparent'
                                }`}
                            >
                                <span className="font-medium">{ep.subtitle || `Episode ${ep.episode}`}</span>
                                <span className="text-xs text-gray-500 group-hover:text-gray-400">{ep.date}</span>
                            </Link>
                        ))
                    ) : (
                        <div className="text-center py-10 text-gray-500">No episodes found</div>
                    )}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}