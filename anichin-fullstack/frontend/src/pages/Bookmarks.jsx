import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Trash2, PlayCircle, AlertCircle, Sword } from 'lucide-react'; // Added Sword
import { AuthContext } from '../App';

const API_URL = 'http://localhost:5000';

export default function Bookmarks() {
  const { token } = useContext(AuthContext);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If user is not logged in, stop loading immediately
    if (!token) {
        setLoading(false);
        return;
    }

    fetchBookmarks();
  }, [token]);

  const fetchBookmarks = () => {
    axios.get(`${API_URL}/user/bookmarks`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
        setBookmarks(res.data);
        setLoading(false);
    })
    .catch(err => {
        console.error(err);
        setError("Failed to load bookmarks. Make sure you are logged in.");
        setLoading(false);
    });
  };

  const removeBookmark = (e, slug) => {
    e.preventDefault(); // Stop the click from opening the anime page
    if(!window.confirm("Remove this anime from your list?")) return;

    axios.delete(`${API_URL}/user/bookmarks?slug=${slug}`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
        // Remove it from the screen immediately without reloading
        setBookmarks(bookmarks.filter(b => b.slug !== slug));
    })
    .catch(err => alert("Failed to remove bookmark"));
  };

  // 1. Not Logged In State
  if (!token) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4 mt-10">
        <AlertCircle className="w-16 h-16 text-gray-500" />
        <h2 className="text-2xl font-bold text-white">Login Required</h2>
        <p className="text-gray-400">Please login to view your saved anime.</p>
        <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition shadow-lg shadow-blue-900/20">
            Login Now
        </Link>
    </div>
  );

  // 2. Loading State (UPDATED)
  if (loading) return (
    <div className="flex flex-col justify-center items-center h-[70vh] space-y-6">
      <div className="relative">
        <div className="absolute inset-0 w-24 h-24 border-4 border-blue-500/30 rounded-full animate-ping"></div>
        <div className="absolute inset-0 w-24 h-24 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin"></div>
        <div className="relative z-10 bg-gray-900/80 p-4 rounded-full border border-blue-500/50">
           <Sword className="w-12 h-12 text-blue-400 animate-sword" />
        </div>
      </div>
      <div className="text-center animate-pulse-text">
        <h3 className="text-xl font-bold text-blue-400 tracking-widest uppercase">Opening Scroll...</h3>
        <p className="text-xs text-gray-500 mt-1">Retrieving your secret techniques</p>
      </div>
    </div>
  );

  // 3. Error State
  if (error) return <div className="text-center text-red-500 mt-20 font-bold">{error}</div>;

  // 4. Success State
  return (
    <div className="min-h-screen pb-20">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-8 w-1.5 bg-blue-500 rounded-full"></div>
        <h1 className="text-3xl font-bold text-white">My List</h1>
      </div>

      {bookmarks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {bookmarks.map((anime, i) => (
            <Link to={`/anime/${anime.slug}`} key={i} className="group relative block bg-gray-800 rounded-xl overflow-hidden shadow-xl hover:scale-105 transition duration-300 border border-gray-700 hover:border-blue-500">
                <div className="aspect-[3/4] relative">
                  <img src={anime.thumbnail} alt={anime.title} className="w-full h-full object-cover transition duration-500 group-hover:opacity-50" loading="lazy" />
                  
                  {/* Remove Button (Top Right) */}
                  <button 
                    onClick={(e) => removeBookmark(e, anime.slug)}
                    className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-700 text-white p-2 rounded-full shadow-lg z-20 transition transform hover:scale-110 opacity-0 group-hover:opacity-100"
                    title="Remove from list"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Play Icon (Center) */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                    <PlayCircle className="w-16 h-16 text-white drop-shadow-lg" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-100 truncate group-hover:text-blue-400 transition">{anime.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">Saved to library</p>
                </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center mt-20 text-gray-400 bg-gray-800/50 p-10 rounded-xl border border-gray-700 max-w-lg mx-auto">
            <h3 className="text-xl font-bold text-white mb-2">Your list is empty</h3>
            <p className="text-sm">Go find some awesome anime to watch!</p>
            <Link to="/" className="inline-block mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition font-bold">
                Browse Anime
            </Link>
        </div>
      )}
    </div>
  );
}