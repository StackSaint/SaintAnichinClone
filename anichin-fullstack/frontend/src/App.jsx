import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Home, Search, Play, User, LogOut, Menu, X } from 'lucide-react';
import HomePage from './pages/HomePage';
import AnimeDetails from './pages/AnimeDetails';
import WatchEpisode from './pages/WatchEpisode';
import AuthPage from './pages/AuthPage';
import Bookmarks from './pages/Bookmarks';
import SearchPage from './pages/SearchPage'; // We will create this next!

export const AuthContext = React.createContext(null);

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  
  const login = (newToken, username) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('username', username);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      <Router>
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans selection:bg-blue-500 selection:text-white">
          <Navbar token={token} logout={logout} />
          <div className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/anime/:slug" element={<AnimeDetails />} />
              <Route path="/watch/:slug" element={<WatchEpisode />} />
              <Route path="/bookmarks" element={<Bookmarks />} />
              <Route path="/search/:query" element={<SearchPage />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

function Navbar({ token, logout }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
        navigate(`/search/${query}`);
        setIsOpen(false); // Close mobile menu if open
    }
  };

  return (
    <nav className="bg-gray-800/95 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="text-2xl font-black tracking-tighter hover:scale-105 transition flex-shrink-0">
            <span className="text-blue-500">ANI</span>
            <span className="text-white">CHIN</span>
          </Link>
          
          {/* Search Bar - Now working! */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-auto relative group">
            <input 
              type="text" 
              placeholder="Search anime..." 
              className="w-full bg-gray-900 text-gray-200 px-5 py-2.5 rounded-full border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition shadow-inner"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button 
                type="submit" 
                className="absolute right-2 top-1.5 p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition cursor-pointer"
            >
                <Search className="h-5 w-5" />
            </button>
          </form>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6 flex-shrink-0">
            <Link to="/" className="flex items-center gap-2 text-gray-300 hover:text-white transition font-medium">
              <Home className="h-5 w-5" /> Home
            </Link>
            {token ? (
              <>
                <Link to="/bookmarks" className="flex items-center gap-2 text-gray-300 hover:text-blue-400 transition font-medium">
                  <User className="h-5 w-5" /> My List
                </Link>
                <button onClick={logout} className="flex items-center gap-2 text-red-400 hover:text-red-300 transition font-medium">
                  <LogOut className="h-5 w-5" /> Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold transition shadow-lg shadow-blue-900/20">
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white p-2" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Search & Menu */}
        {isOpen && (
            <div className="md:hidden mt-4 space-y-4 pb-4">
                <form onSubmit={handleSearch} className="relative">
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button type="submit" className="absolute right-3 top-3 text-gray-400">
                        <Search className="h-5 w-5" />
                    </button>
                </form>
                <div className="flex flex-col gap-2">
                    <Link to="/" onClick={() => setIsOpen(false)} className="block py-2 text-gray-300">Home</Link>
                    {token ? (
                        <>
                            <Link to="/bookmarks" onClick={() => setIsOpen(false)} className="block py-2 text-gray-300">My List</Link>
                            <button onClick={() => {logout(); setIsOpen(false);}} className="block py-2 text-red-400 text-left">Logout</button>
                        </>
                    ) : (
                        <Link to="/login" onClick={() => setIsOpen(false)} className="block py-2 text-blue-400 font-bold">Login</Link>
                    )}
                </div>
            </div>
        )}
      </div>
    </nav>
  );
}

export default App;