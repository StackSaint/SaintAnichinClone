import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { User, Lock, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

const API_URL = 'https://saint-immortal.vercel.app';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Register
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null); // Clear error when typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isLogin) {
        // --- LOGIN LOGIC ---
        const res = await axios.post(`${API_URL}/auth/login`, formData);
        
        // Save token and redirect
        login(res.data.access_token, res.data.username);
        navigate('/'); // Go to Homepage
      } else {
        // --- REGISTER LOGIC ---
        await axios.post(`${API_URL}/auth/register`, formData);
        setSuccess("Account created! Please login.");
        setIsLogin(true); // Switch to login mode automatically
        setFormData({ username: '', password: '' });
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-400">
            {isLogin ? 'Login to access your watchlist' : 'Join to save your favorite anime'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" /> {error}
            </div>
        )}

        {/* Success Message */}
        {success && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-3 rounded-lg mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" /> {success}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Username Input */}
          <div className="relative group">
            <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition" />
            <input
              type="text"
              name="username"
              required
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full bg-gray-900 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>

          {/* Password Input */}
          <div className="relative group">
            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition" />
            <input
              type="password"
              name="password"
              required
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-gray-900 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
                <>
                    {isLogin ? 'Login' : 'Sign Up'} <ArrowRight className="w-5 h-5" />
                </>
            )}
          </button>
        </form>

        {/* Toggle Login/Register */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                  setSuccess(null);
              }}
              className="text-blue-400 hover:text-blue-300 font-bold hover:underline transition"
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}