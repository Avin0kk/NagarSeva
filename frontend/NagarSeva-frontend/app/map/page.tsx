'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';

const MapView = dynamic(() => import('@/components/Mapview'), { ssr: false });

export default function MapPage() {
  const [allComplaints, setAllComplaints] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  useEffect(() => {
    api.get('/complaints/map')
      .then(res => {
        setAllComplaints(res.data);
        setFiltered(res.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filterByStatus = (status: string | null) => {
    setActiveFilter(status);
    if (status === null) {
      setFiltered(allComplaints);
    } else {
      setFiltered(allComplaints.filter(c => c.status === status));
    }
  };

  if (loading) {
    return <div className="w-full h-screen flex items-center justify-center">Loading map...</div>;
  }

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Filter buttons */}
      <div className="bg-white dark:bg-neutral-900 border-b dark:border-neutral-800 p-4 flex gap-2">
        <Button
          variant={activeFilter === null ? "default" : "outline"}
          onClick={() => filterByStatus(null)}
          size="sm"
        >
          All ({allComplaints.length})
        </Button>
        <Button
          variant={activeFilter === "OPEN" ? "default" : "outline"}
          onClick={() => filterByStatus("OPEN")}
          size="sm"
          className={activeFilter === "OPEN" ? "bg-blue-600" : ""}
        >
          🔴 Open ({allComplaints.filter(c => c.status === "OPEN").length})
        </Button>
        <Button
          variant={activeFilter === "IN_PROGRESS" ? "default" : "outline"}
          onClick={() => filterByStatus("IN_PROGRESS")}
          size="sm"
          className={activeFilter === "IN_PROGRESS" ? "bg-orange-600" : ""}
        >
          🟡 In Progress ({allComplaints.filter(c => c.status === "IN_PROGRESS").length})
        </Button>
        <Button
          variant={activeFilter === "ESCALATED" ? "default" : "outline"}
          onClick={() => filterByStatus("ESCALATED")}
          size="sm"
          className={activeFilter === "ESCALATED" ? "bg-purple-600" : ""}
        >
          🟣 Escalated ({allComplaints.filter(c => c.status === "ESCALATED").length})
        </Button>
        <Button
          variant={activeFilter === "RESOLVED" ? "default" : "outline"}
          onClick={() => filterByStatus("RESOLVED")}
          size="sm"
          className={activeFilter === "RESOLVED" ? "bg-green-600" : ""}
        >
          🟢 Resolved ({allComplaints.filter(c => c.status === "RESOLVED").length})
        </Button>
      </div>

      {/* Map */}
      <div className="flex-1">
        <MapViewWithFiltered complaints={filtered} />
      </div>
    </div>
  );
}

function MapViewWithFiltered({ complaints }: { complaints: any[] }) {
  return (
    <MapView initialComplaints={complaints} />
  );
}