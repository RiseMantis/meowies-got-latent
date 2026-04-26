'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface TrendData {
  hour: number;
  averageSoundTag: number;
  reportCount: number;
}

interface SensoryTrendsChartProps {
  locationId: string;
}

export default function SensoryTrendsChart({ locationId }: SensoryTrendsChartProps) {
  const [data, setData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/locations/${locationId}/trends`);
        if (!res.ok) {
          throw new Error('Failed to fetch trends data');
        }
        const responseData = await res.json();
        setData(responseData.trends || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (locationId) {
      fetchTrends();
    }
  }, [locationId]);

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-lg">
        <p className="text-slate-500 dark:text-slate-400">Loading trends...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-lg">
        <p className="text-red-600 dark:text-red-400">Error: {error}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-lg">
        <p className="text-slate-500 dark:text-slate-400">No trend data available</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
        Quietest Hours (Higher = Quieter)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.3} />
          <XAxis
            dataKey="hour"
            stroke="currentColor"
            style={{ fontSize: '12px' }}
            label={{ value: 'Hour of Day', position: 'insideBottom', offset: -2 }}
          />
          <YAxis
            stroke="currentColor"
            domain={[1, 5]}
            label={{ value: 'Avg Sound Level', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(30, 41, 59, 0.95)',
              border: '1px solid rgba(71, 85, 105, 0.5)',
              borderRadius: '8px',
              color: '#e2e8f0'
            }}
            formatter={(value: any, name: string) => [
              `${value.toFixed(2)} (${name === 'averageSoundTag' ? 'quieter' : 'reports'})`,
              name === 'averageSoundTag' ? 'Sound Level' : 'Report Count'
            ]}
            labelFormatter={(label) => `Hour ${label}:00`}
          />
          <Line
            type="monotone"
            dataKey="averageSoundTag"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ fill: '#10b981', r: 4 }}
            activeDot={{ r: 6 }}
            name="averageSoundTag"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}