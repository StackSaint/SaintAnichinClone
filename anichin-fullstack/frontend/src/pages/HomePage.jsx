import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
// import { AlertCircle } from 'lucide-react'; // Removed PlayCircle import
import { PlayCircle, AlertCircle, Sword } from 'lucide-react'; // Add 'Sword'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function HomePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Connection Error:", err);
        setError("Could not connect to Backend. Is your Python server running?");
        setLoading(false);
      });
  }, []);

  // REPLACES THE OLD LOADING BLOCK
  if (loading) return (
    <div className="flex flex-col justify-center items-center h-[70vh] space-y-8">
      
      {/* MAGIC CIRCLE CONTAINER */}
      <div className="relative flex items-center justify-center w-32 h-32">
        
        {/* Ring 1: Outer Circle (Spins Reverse) */}
        <div className="absolute inset-0 w-full h-full border-[3px] border-blue-500/30 border-t-blue-400 border-l-blue-400 rounded-full animate-spin-reverse"></div>
        
        {/* Ring 2: Inner Circle (Spins Normal & Slow) */}
        <div className="absolute w-24 h-24 border-[3px] border-cyan-500/20 border-b-cyan-400 border-r-cyan-400 rounded-full animate-spin-slow"></div>

        {/* Ring 3: Static Glow Background */}
        <div className="absolute w-20 h-20 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>

        {/* THE SWORD (Centered & Floating) */}
        <div className="relative z-10 p-3">
           <Sword className="w-14 h-14 text-white drop-shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-sword-pulse" fill="currentColor" />
        </div>

      </div>
      
      {/* Loading Text */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 tracking-[0.2em] uppercase animate-pulse">
          Summoning
        </h3>
        <p className="text-xs text-blue-500/60 font-mono">Gathering Qi from the Heavens...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="text-center mt-20 p-4 bg-red-900/20 rounded-xl border border-red-500/50 mx-auto max-w-lg">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
        <h3 className="text-xl font-bold text-white">Connection Failed</h3>
        <p className="text-gray-400 mt-2">{error}</p>
    </div>
  );

  return (
    <div className="space-y-12 pb-20">
      {/* Hero / Latest Updates */}
      {data?.results?.map((section, idx) => (
        <div key={idx} className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-8 w-1.5 bg-blue-500 rounded-full"></div>
            <h2 className="text-3xl font-bold text-white capitalize tracking-wide">
              {section.section.replace(/_/g, ' ')}
            </h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {section.cards.map((anime, i) => {
               // SMART ROUTING: Detect if this is an episode or an anime
               const isEpisode = anime.slug.toLowerCase().includes('episode');
               const linkTarget = isEpisode ? `/watch/${anime.slug}` : `/anime/${anime.slug}`;

               return (
                  <Link to={linkTarget} key={i} className="group relative block bg-gray-800 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-300 hover:-translate-y-1">
                    <div className="aspect-[3/4] overflow-hidden relative">
                      <img 
                        src={anime.thumbnail} 
                        alt={anime.title} 
                        className="w-full h-full object-cover transition duration-500" 
                        loading="lazy"
                      />
                      
                      {/* REMOVED: The Play Icon Overlay was here */}

                      {/* Type Label */}
                      <div className="absolute top-0 right-0 m-2">
                         <span className={`text-xs font-bold px-2 py-1 rounded shadow-lg backdrop-blur-md text-white ${isEpisode ? 'bg-red-600/90' : 'bg-blue-600/90'}`}>
                          {isEpisode ? 'EPISODE' : anime.type}
                         </span>
                      </div>

                      {/* Episode Number Label */}
                      {anime.eps && (
                        <div className="absolute bottom-0 left-0 m-2">
                           <span className="bg-black/70 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded border border-gray-600">
                            Ep {anime.eps}
                           </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-100 truncate group-hover:text-blue-400 transition">{anime.title}</h3>
                      <p className="text-gray-400 text-xs mt-1 truncate">{anime.headline}</p>
                    </div>
                  </Link>
               );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}