import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { PlayCircle, Search as SearchIcon, Sword } from 'lucide-react'; // Added Sword

const API_URL = 'http://localhost:5000';

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
        <div className="flex flex-col justify-center items-center h-[50vh] space-y-6">
          <div className="relative">
            <div className="absolute inset-0 w-24 h-24 border-4 border-blue-500/30 rounded-full animate-ping"></div>
            <div className="absolute inset-0 w-24 h-24 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin"></div>
            <div className="relative z-10 bg-gray-900/80 p-4 rounded-full border border-blue-500/50">
               <Sword className="w-12 h-12 text-blue-400 animate-sword" />
            </div>
          </div>
          <div className="text-center animate-pulse-text">
            <h3 className="text-xl font-bold text-blue-400 tracking-widest uppercase">Searching...</h3>
            <p className="text-xs text-gray-500 mt-1">Scouring the archives</p>
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
            <p className="text-sm mt-2">Try searching for "One Piece" or "Naruto"</p>
        </div>
      )}
    </div>
  );
}