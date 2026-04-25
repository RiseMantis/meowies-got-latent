'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { 
  History, MapPin, Star, Moon, Bell, ChevronRight, 
  Store, CheckCircle2, UserCircle, LogOut 
} from 'lucide-react';
import './prof.css';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profileData, setProfileData] = useState<any>(null);
  const [recentSearches, setRecentSearches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Settings state (placeholder functionality)
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    // Load recent searches from localStorage
    try {
      const saved = localStorage.getItem('wac_recent_searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load recent searches', e);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/user/profile')
        .then(res => res.json())
        .then(data => {
          setProfileData(data.user);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch profile', err);
          setLoading(false);
        });
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  if (loading || status === 'loading') {
    return (
      <div className="profile-bg flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="profile-bg flex flex-col items-center justify-center p-6 text-center">
        <UserCircle className="w-24 h-24 text-indigo-300 mb-6" />
        <h1 className="text-2xl font-bold text-slate-700 mb-2">You're not logged in!</h1>
        <p className="text-slate-500 mb-8 max-w-sm">
          Please log in to view your profile, manage your registered locations, and track your sensory reports.
        </p>
        <button 
          onClick={() => router.push('/')}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-3 rounded-2xl font-medium shadow-lg shadow-indigo-200 transition-all active:scale-95"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="profile-bg overflow-y-auto">
      <div className="max-w-lg mx-auto w-full px-5 pt-10 pb-6 flex flex-col gap-6">
        
        {/* Header & User Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-xl rounded-[32px] p-6 border border-white/60 shadow-[0_8px_32px_rgba(100,116,139,0.1)] flex flex-col items-center text-center"
        >
          <div className="profile-ring mb-4">
            {session?.user?.image ? (
              <img src={session.user.image} alt="Profile" className="w-20 h-20 rounded-full object-cover border-4 border-white" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center border-4 border-white text-indigo-500">
                <UserCircle className="w-10 h-10" />
              </div>
            )}
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{session?.user?.name || 'Explorer'}</h2>
          <p className="text-sm text-slate-500 mt-1">{session?.user?.email}</p>

          <div className="flex gap-6 mt-6 w-full px-4">
            <div className="flex-1 flex flex-col items-center p-3 bg-white/50 rounded-2xl shadow-sm">
              <span className="text-2xl font-bold text-indigo-500">{profileData?.registeredLocations?.length || 0}</span>
              <span className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wide">Stores</span>
            </div>
            <div className="flex-1 flex flex-col items-center p-3 bg-white/50 rounded-2xl shadow-sm">
              <span className="text-2xl font-bold text-rose-400">{profileData?.reports?.length || 0}</span>
              <span className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wide">Reviews</span>
            </div>
          </div>
        </motion.div>

        {/* Recent Searches */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-lg font-bold text-slate-700 mb-3 px-2 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" /> Recent Searches
          </h3>
          <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-white/50 shadow-sm overflow-hidden p-2">
            {recentSearches.length > 0 ? (
              <div className="flex flex-col">
                {recentSearches.map((search, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 hover:bg-white/50 rounded-2xl transition-colors cursor-pointer">
                    <div className="bg-indigo-100/50 p-2 rounded-full">
                      <MapPin className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-semibold text-slate-700 truncate">{search.name}</span>
                      <span className="text-xs text-slate-500 truncate">{search.address}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">No recent searches yet.</p>
            )}
          </div>
        </motion.div>

        {/* Registered Stores */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-bold text-slate-700 mb-3 px-2 flex items-center gap-2">
            <Store className="w-5 h-5 text-emerald-500" /> My Stores
          </h3>
          <div className="flex flex-col gap-3">
            {profileData?.registeredLocations?.length > 0 ? (
              profileData.registeredLocations.map((store: any) => (
                <div key={store.id} className="bg-white/70 backdrop-blur-md p-4 rounded-3xl border border-white/60 shadow-sm flex items-center justify-between">
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-semibold text-slate-700 truncate">{store.name}</span>
                    <span className="text-xs text-slate-500 truncate mt-0.5">{store.address}</span>
                  </div>
                  {store.isVerified && (
                    <div className="bg-emerald-100 text-emerald-600 px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0 ml-3">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Verified</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-white/50 p-6 text-center">
                <p className="text-sm text-slate-500">You haven't registered any stores yet.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* My Reviews */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-bold text-slate-700 mb-3 px-2 flex items-center gap-2">
            <Star className="w-5 h-5 text-rose-400" /> My Reviews
          </h3>
          <div className="flex flex-col gap-3">
            {profileData?.reports?.length > 0 ? (
              profileData.reports.map((report: any) => (
                <div key={report.id} className="bg-white/70 backdrop-blur-md p-4 rounded-3xl border border-white/60 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-slate-700 text-sm truncate pr-2">
                      {report.location?.name || 'Unknown Location'}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full shrink-0">
                      <CheckCircle2 className="w-3 h-3" />
                      {report.confirms} verifications
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                     {/* Simplified star visualization for compactness */}
                     <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="w-12">Noise:</span>
                        <div className="flex gap-0.5">
                          {[...Array(report.soundTag)].map((_, i) => <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400"/>)}
                        </div>
                     </div>
                     <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="w-12">Crowd:</span>
                        <div className="flex gap-0.5">
                          {[...Array(report.crowdTag)].map((_, i) => <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400"/>)}
                        </div>
                     </div>
                     <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="w-12">Aroma:</span>
                        <div className="flex gap-0.5">
                          {[...Array(report.aromaTag)].map((_, i) => <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400"/>)}
                        </div>
                     </div>
                     <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="w-12">Light:</span>
                        <div className="flex gap-0.5">
                          {[...Array(report.lightTag)].map((_, i) => <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400"/>)}
                        </div>
                     </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-white/50 p-6 text-center">
                <p className="text-sm text-slate-500">You haven't reviewed any places yet.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Settings */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/70 backdrop-blur-xl rounded-[32px] p-2 border border-white/60 shadow-sm mb-6"
        >
          <div className="flex items-center justify-between p-4 border-b border-slate-100/50">
            <div className="flex items-center gap-3">
              <div className="bg-slate-100 p-2 rounded-xl">
                <Moon className="w-5 h-5 text-slate-600" />
              </div>
              <span className="font-semibold text-slate-700">Dark Mode</span>
            </div>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`w-12 h-6 rounded-full transition-colors relative ${darkMode ? 'bg-indigo-500' : 'bg-slate-200'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="bg-rose-100/50 p-2 rounded-xl">
                <Bell className="w-5 h-5 text-rose-500" />
              </div>
              <span className="font-semibold text-slate-700">Notifications</span>
            </div>
            <button 
              onClick={() => setNotifications(!notifications)}
              className={`w-12 h-6 rounded-full transition-colors relative ${notifications ? 'bg-indigo-500' : 'bg-slate-200'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${notifications ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
