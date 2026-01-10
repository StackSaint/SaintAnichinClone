import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { PlayCircle, Search as SearchIcon, Sword } from 'lucide-react'; // Added Sword

const API_URL = 'https://saint-immortal.vercel.app';

export default function SearchPage() {
  const { query } = useParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_URL}/search/${query}`)
      .then(res => {
        setResults(res.data.results || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [query]);

  return (
    <div className="min-h-screen">
      <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
        <SearchIcon className="text-blue-500" />
        Results for "{query}"
      </h1>

      {loading ? (
        // --- NEW LOADING ANIMATION ---
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
                  Searching 
                </h3>
                <p className="text-xs text-blue-500/60 font-mono">Searching in storage ring...</p>
              </div>
            </div>
        // -----------------------------
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {results.map((anime, i) => (
            <Link to={`/anime/${anime.slug}`} key={i} className="group relative block bg-gray-800 rounded-xl overflow-hidden shadow-xl hover:scale-105 transition duration-300">
                <div className="aspect-[3/4] relative">
                  <img src={anime.thumbnail} alt={anime.title} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/40">
                    <PlayCircle className="w-16 h-16 text-white drop-shadow-lg" />
                  </div>
                  <div className="absolute top-2 right-2 bg-blue-600 text-xs font-bold px-2 py-1 rounded text-white shadow">
                    {anime.type}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-100 truncate">{anime.title}</h3>
                  <p className="text-gray-400 text-xs mt-1">{anime.status}</p>
                </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center mt-20 text-gray-400">
            <p className="text-xl">No results found.</p>
            <p className="text-sm mt-2">Try searching for "Renegade Immortal" or "Soul Land"</p>
        </div>
      )}
    </div>
  );
}