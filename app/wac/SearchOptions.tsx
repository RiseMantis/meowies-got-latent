import { motion, AnimatePresence } from 'framer-motion';
import { useMapStore } from '@/store/mapStore';
import { MapPin } from 'lucide-react';

export function SearchOptions({ data, onSelect }: { data: any[], onSelect: () => void }) {
  const setSelectedLocation = useMapStore((s: any) => s.setSelectedLocation); 

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-white/60 dark:border-slate-700/60 rounded-3xl shadow-[0_12px_40px_rgba(100,116,139,0.15)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        <div className="max-h-[300px] overflow-y-auto w-full p-2 flex flex-col gap-1">
          {data.map((place, index) => (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              key={place.placeId}
              onClick={() => {
                setSelectedLocation(place);
                
                // Save to recent searches in localStorage
                try {
                  const existing = localStorage.getItem('wac_recent_searches');
                  let searches = existing ? JSON.parse(existing) : [];
                  // Remove if already exists to move to top
                  searches = searches.filter((s: any) => s.placeId !== place.placeId);
                  // Add to beginning
                  searches.unshift(place);
                  // Keep only 5
                  searches = searches.slice(0, 5);
                  localStorage.setItem('wac_recent_searches', JSON.stringify(searches));
                } catch (err) {
                  console.error('Failed to save search history', err);
                }

                onSelect(); // Tell parent to hide dropdown
              }}
              className="flex items-center gap-4 w-full p-4 rounded-2xl hover:bg-[#ffedd5]/60 dark:hover:bg-slate-700/60 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.98]"
            >
              <div className="bg-[#a5b4fc]/20 dark:bg-indigo-900/30 p-2 rounded-full shrink-0">
                <MapPin className="w-5 h-5 text-[#818cf8]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">{place.name}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400 truncate">{place.address}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}