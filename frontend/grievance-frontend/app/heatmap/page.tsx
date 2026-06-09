'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Card, CardContent } from '@/components/ui/card';
import dynamic from 'next/dynamic';
const HeatmapViewer = dynamic(() => import('@/components/HeatmapViewer'), { ssr: false });
import ThemeToggle from '@/components/ThemeToggle';

export default function HeatmapPage() {
  const [wards, setWards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/complaints/admin/heatmap')
      .then(res => setWards(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="w-full h-screen flex items-center justify-center">Loading heatmap...</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="bg-white dark:bg-neutral-900 border-b dark:border-neutral-800 px-8 py-4 flex justify-between items-center">
        <div>
            <h1 className="font-bold text-2xl text-neutral-900 dark:text-white">Complaint Heatmap</h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">Ward-level complaint density & resolution status</p>
        </div>
      <ThemeToggle />
      </header>

      <main className="max-w-7xl mx-auto p-8">
        <Card className="mb-8 dark:bg-neutral-900 dark:border-neutral-800">
          <CardContent className="pt-6" style={{ height: '1000px' }}>
            <HeatmapViewer wards={wards} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}