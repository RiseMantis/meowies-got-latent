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
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 right-0 h-full w-[90vw] md:w-[400px] z-[2000] p-4"
        >
          {/* Calm, glassmorphic container with soft rounded edges */}
          <div className="h-full w-full bg-white/60 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(100,116,139,0.1)] rounded-[32px] p-6 flex flex-col gap-6 overflow-y-auto">
            
            {/* Header with rounded close button */}
            <div className="flex justify-between items-start">
              <div className="bg-soft-peach/50 text-terracotta p-3 rounded-2xl shadow-sm">
                <Heart className="w-8 h-8 text-[#fca5a5]" fill="#fca5a5" />
              </div>
              <button 
                onClick={() => setSelectedLocation(null)}
                className="bg-white/50 hover:bg-white/80 transition-all p-2 rounded-full text-slate-500 shadow-sm"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold text-slate-700 tracking-tight">
                {selectedLocation.name || 'Friendly Location'}
              </h2>
              <div className="flex items-start gap-2 text-slate-500 mt-1">
                <MapPin className="w-5 h-5 shrink-0 mt-0.5 text-[#a5b4fc]" />
                <p className="text-sm leading-relaxed">{selectedLocation.address}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4">
              <button 
                onClick={() => setRouteEnd(selectedLocation)}
                className="flex-1 bg-[#a5b4fc] hover:bg-[#818cf8] text-white py-3 px-4 rounded-2xl font-medium transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2"
              >
                <Navigation className="w-5 h-5" />
                Go Here
              </button>
              <button className="flex-1 bg-white hover:bg-slate-50 text-slate-600 border border-slate-100 py-3 px-4 rounded-2xl font-medium transition-all shadow-sm flex items-center justify-center gap-2">
                <Info className="w-5 h-5 text-slate-400" />
                Details
              </button>
            </div>

            {/* Sensory Reviews Section */}
            <SensoryReviews locationId={selectedLocation.id} />

            {/* Soft decorative elements to reinforce calm/pet theme */}
            <div className="mt-8 p-5 bg-gradient-to-br from-warm-sand/50 to-soft-peach/30 rounded-3xl border border-white/60">
              <p className="text-sm text-slate-600 italic text-center">
                “A perfect spot for a calm afternoon stroll.” 🐾
              </p>
            </div>
            
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
