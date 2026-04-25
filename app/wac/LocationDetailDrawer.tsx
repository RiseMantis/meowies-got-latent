import { motion, AnimatePresence } from 'framer-motion';
import { useMapStore } from '@/store/mapStore';
import { X, MapPin, Navigation, Info, Heart } from 'lucide-react';

import SensoryReviews from './SensoryReviews';

export default function LocationDetailDrawer() {
  const selectedLocation = useMapStore((s: any) => s.selectedLocation);
  const setSelectedLocation = useMapStore((s: any) => s.setSelectedLocation);
  const setRouteEnd = useMapStore((s: any) => s.setRouteEnd);

  return (
    <AnimatePresence>
      {selectedLocation && (
        <motion.div
          initial={{ y: '100%', x: 0, opacity: 0 }} // Mobile default (slide from bottom)
          animate={{ 
            y: selectedLocation ? 0 : '100%', 
            x: 0, 
            opacity: 1 
          }}
          exit={{ y: '100%', opacity: 0 }}
          // Desktop Overrides: use variants or media queries in the style if needed, 
          // but for simplicity, we can use the Tailwind classes for positioning:
          className="
            /* Mobile: Full width at bottom */
            fixed bottom-0 left-0 w-full h-[40vh] z-[2000] p-3
            
            /* Desktop: Sidebar on the right */
            md:top-0 md:right-0 md:bottom-auto md:left-auto md:h-full md:w-[400px] md:p-4
          "
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {/* The Inner Container */}
          <div className="
            h-full w-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl 
            border-t border-white/40 dark:border-slate-800/40 shadow-2xl 
            
            /* Mobile: Rounded top only */
            rounded-t-[32px] 
            
            /* Desktop: Full rounded edges */
            md:rounded-[32px] md:border
            
            p-6 flex flex-col gap-6 overflow-y-auto transition-colors
          ">

            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-2 md:hidden" />
            
            {/* Header with rounded close button */}
            <div className="flex justify-between items-start">
              <div className="bg-soft-peach/50 dark:bg-rose-900/30 text-terracotta p-3 rounded-2xl shadow-sm">
                <Heart className="w-8 h-8 text-[#fca5a5] dark:text-rose-400" fill="#fca5a5" />
              </div>
              <button 
                onClick={() => setSelectedLocation(null)}
                className="bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-700/80 transition-all p-2 rounded-full text-slate-500 dark:text-slate-400 shadow-sm"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-100 tracking-tight">
                {selectedLocation.name || 'Friendly Location'}
              </h2>
              <div className="flex items-start gap-2 text-slate-500 dark:text-slate-400 mt-1">
                <MapPin className="w-5 h-5 shrink-0 mt-0.5 text-[#a5b4fc] dark:text-indigo-400" />
                <p className="text-sm leading-relaxed">{selectedLocation.address}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4">
              <button 
                onClick={() => setRouteEnd(selectedLocation)}
                className="flex-1 bg-[#a5b4fc] dark:bg-indigo-600 hover:bg-[#818cf8] dark:hover:bg-indigo-500 text-white py-3 px-4 rounded-2xl font-medium transition-all shadow-md shadow-indigo-100 dark:shadow-none flex items-center justify-center gap-2"
              >
                <Navigation className="w-5 h-5" />
                Go Here
              </button>
            </div>

            {/* Sensory Reviews Section */}
            <SensoryReviews locationId={selectedLocation.id} />
            
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
