import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PlayCircle, Bookmark, Calendar, Star, Info, AlertTriangle, Sword } from 'lucide-react'; // Added Sword
import { AuthContext } from '../App';

const API_URL = 'https://saint-immortal.vercel.app';

export default function AnimeDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setError(null);

    axios.get(`${API_URL}/anime/${slug}`)
      .then(res => {
        // CHECK: If result is empty, it might be an episode slug
        if (!res.data || !res.data.result || Object.keys(res.data.result).length === 0) {
            // If the slug contains "episode", it's definitely an episode link
            if (slug.includes('episode')) {
                setError("IS_EPISODE");
            } else {
                setError("Data not found. The slug might be invalid.");
            }
        } else {
            setInfo(res.data.result); 
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Connection failed. Check your Python backend terminal.");
        setLoading(false);
      });
  }, [slug]);

  const handleBookmark = async () => {
    if (!token) return alert("Please login to bookmark!");
    try {
      await axios.post(`${API_URL}/user/bookmarks`, 
        { slug, title: info.name, thumbnail: info.thumbnail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Added to Bookmarks!");
    } catch (err) {
      alert("Already in your list or session expired.");
    }
  };

  // 1. Loading State (UPDATED)
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
        <h3 className="text-xl font-bold text-blue-400 tracking-widest uppercase">Analyzing Spirit...</h3>
        <p className="text-xs text-gray-500 mt-1">Measuring cultivation level</p>
      </div>
    </div>
  );

  // 2. Fix for "Blank Screen" (Episode Detection)
  if (error === "IS_EPISODE") return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-6">
        <PlayCircle className="w-20 h-20 text-blue-500" />
        <h2 className="text-3xl font-bold text-white">Direct Episode Link Detected</h2>
        <p className="text-gray-400 max-w-lg">
            You clicked a link for a specific episode, not the main anime page.
        </p>
        <div className="flex gap-4">
            <button 
                onClick={() => navigate(`/watch/${slug}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition"
            >
                Watch Now
            </button>
            <Link to="/" className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-bold transition">
                Back Home
            </Link>
        </div>
    </div>
  );

  // 3. General Error State
  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Error Loading Anime</h2>
        <p className="text-gray-400 mb-6">{error}</p>
        <Link to="/" className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition">
            Back to Home
        </Link>
    </div>
  );

  // 4. Success State (Render Anime Details)
  return (
    <div className="min-h-screen text-gray-100 pb-20">
      {/* Hero Section */}
      <div className="relative w-full">
        <div className="absolute inset-0 h-[50vh] overflow-hidden">
             {info.thumbnail && <img src={info.thumbnail} className="w-full h-full object-cover blur-3xl opacity-20" />}
             <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900"></div>
        </div>

        <div className="relative container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-72 flex-shrink-0 mx-auto">
            <img src={info.thumbnail} alt={info.name} className="w-full rounded-xl shadow-2xl border border-gray-700" />
            <button onClick={handleBookmark} className="w-full mt-4 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg font-bold transition border border-gray-600">
                <Bookmark className="w-5 h-5" /> Add to List
            </button>
          </div>

          <div className="flex-1 space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-white">{info.name}</h1>
            <div className="flex flex-wrap gap-3">
              {info.genre?.map((g, i) => (
                <span key={i} className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm font-medium border border-blue-600/30">{g}</span>
              ))}
            </div>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-800/50 p-4 rounded-xl border border-gray-700 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <Star className="text-yellow-400" />
                    <div><p className="text-xs text-gray-400">Rating</p><p className="font-bold text-white">{info.rating || "?"}</p></div>
                </div>
                <div className="flex items-center gap-3">
                    <Info className="text-blue-400" />
                    <div><p className="text-xs text-gray-400">Status</p><p className="font-bold text-white">{info.status || "?"}</p></div>
                </div>
                <div className="flex items-center gap-3">
                    <Calendar className="text-green-400" />
                    <div><p className="text-xs text-gray-400">Released</p><p className="font-bold text-white">{info.released || "?"}</p></div>
                </div>
            </div>
            <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                {info.sinopsis?.paragraphs ? info.sinopsis.paragraphs.join(" ") : info.sinopsis || "No synopsis available."}
            </p>
          </div>
        </div>
      </div>

      {/* Episode List */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
            <PlayCircle className="text-blue-500" /> Episodes
        </h2>
        {info.episode && info.episode.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {info.episode.map((ep, i) => (
                    <Link key={i} to={`/watch/${ep.slug}`} className="group bg-gray-800 hover:bg-gray-700 p-3 rounded-lg transition border border-gray-700 hover:border-blue-500">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-gray-400 text-xs font-mono">EP</span>
                            <span className="text-blue-400 font-bold text-lg">{ep.episode}</span>
                        </div>
                        <div className="text-sm font-medium text-gray-200 group-hover:text-white truncate">
                            {ep.subtitle || `Episode ${ep.episode}`}
                        </div>
                        <div className="text-xs text-gray-500 mt-2">{ep.date}</div>
                    </Link>
                ))}
            </div>
        ) : ( <p className="text-gray-500 italic">No episode list found.</p> )}
      </div>
    </div>
  );
}