'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface SubmitReviewFormProps {
  locationId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function SubmitReviewForm({ locationId, onSuccess, onCancel }: SubmitReviewFormProps) {
  const [ratings, setRatings] = useState({
    noise: 0,
    crowd: 0,
    aroma: 0,
    lighting: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tags = [
    { key: 'noise', label: 'Noise (1: Noisy, 5: Quiet)' },
    { key: 'crowd', label: 'Crowd (1: Crowded, 5: Empty)' },
    { key: 'aroma', label: 'Aroma (1: Bad, 5: Pleasant)' },
    { key: 'lighting', label: 'Lighting (1: Poor, 5: Bright)' },
  ];

  const handleStarClick = (tag: string, value: number) => {
    setRatings(prev => ({ ...prev, [tag]: value }));
  };

  const handleSubmit = async () => {
    if (Object.values(ratings).some(v => v === 0)) {
      setError('Please provide a rating for all tags.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/locations/${locationId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          soundTag: ratings.noise,
          crowdTag: ratings.crowd,
          aromaTag: ratings.aroma,
          lightTag: ratings.lighting,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit review (Make sure you are logged in)');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-5 rounded-2xl border border-indigo-100 dark:border-slate-700 shadow-sm mt-4 transition-colors"
    >
      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">Add a Sensory Review</h3>
      
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <div className="flex flex-col gap-4">
        {tags.map(tag => (
          <div key={tag.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{tag.label}</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => handleStarClick(tag.key, star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star 
                    className={`w-6 h-6 ${ratings[tag.key as keyof typeof ratings] >= star ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 dark:text-slate-600'}`} 
                  />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-6">
        <button 
          onClick={onCancel}
          className="flex-1 py-2 rounded-xl text-slate-500 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button 
          onClick={handleSubmit}
          className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-xl font-medium shadow-md shadow-indigo-200 transition-colors disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>
    </motion.div>
  );
}
