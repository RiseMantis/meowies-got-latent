'use client';

import { useEffect, useState } from 'react';
import { Star, ThumbsUp, CheckCircle2 } from 'lucide-react';
import SubmitReviewForm from './SubmitReviewForm';

interface SensoryReviewsProps {
  locationId: string;
}

export default function SensoryReviews({ locationId }: SensoryReviewsProps) {
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [topReviews, setTopReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'recent' | 'top'>('recent');
  const [showForm, setShowForm] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/locations/${locationId}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setRecentReviews(data.recentReviews || []);
        setTopReviews(data.topReviews || []);
      }
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (locationId) {
      fetchReviews();
    }
  }, [locationId]);

  const handleVerify = async (reviewId: string) => {
    setVerifyingId(reviewId);
    try {
      const res = await fetch(`/api/locations/${locationId}/reviews/${reviewId}/verify`, {
        method: 'POST',
      });
      if (res.ok) {
        await fetchReviews(); // refresh to show updated counts
      }
    } catch (err) {
      console.error('Failed to verify review', err);
    } finally {
      setVerifyingId(null);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star 
            key={star} 
            className={`w-3.5 h-3.5 ${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} 
          />
        ))}
      </div>
    );
  };

  const reviewsToShow = activeTab === 'recent' ? recentReviews : topReviews;

  return (
    <div className="mt-6 border-t border-slate-100 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-slate-700">Sensory Reports</h3>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="text-sm bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-full font-medium transition-colors"
        >
          {showForm ? 'Close Form' : 'Add Review'}
        </button>
      </div>

      {showForm && (
        <SubmitReviewForm 
          locationId={locationId} 
          onSuccess={() => {
            setShowForm(false);
            fetchReviews();
          }} 
          onCancel={() => setShowForm(false)} 
        />
      )}

      {!showForm && (
        <>
          <div className="flex gap-2 mb-4 bg-slate-100/50 p-1 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('recent')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'recent' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Recent 5
            </button>
            <button
              onClick={() => setActiveTab('top')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'top' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Top 5
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-slate-500 text-center py-4">Loading reports...</p>
          ) : reviewsToShow.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4 bg-slate-50 rounded-xl">No reports yet. Be the first!</p>
          ) : (
            <div className="flex flex-col gap-3">
              {reviewsToShow.map(review => (
                <div key={review.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-slate-700 text-sm flex items-center gap-2">
                        {review.user?.name || 'Anonymous User'}
                        {activeTab === 'top' && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> Top</span>}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleVerify(review.id)}
                      disabled={verifyingId === review.id}
                      className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-full transition-colors disabled:opacity-50"
                      title="Verify this review"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verify ({review.confirms})
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 text-xs">Noise</span>
                      {renderStars(review.soundTag)}
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 text-xs">Crowd</span>
                      {renderStars(review.crowdTag)}
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 text-xs">Aroma</span>
                      {renderStars(review.aromaTag)}
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 text-xs">Lighting</span>
                      {renderStars(review.lightTag)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
