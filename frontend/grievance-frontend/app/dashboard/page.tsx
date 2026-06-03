'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { MessageSquareWarning, LogOut, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const statusColors: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  ESCALATED: 'bg-red-100 text-red-700',
  RESOLVED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-neutral-100 text-neutral-700',
};

export default function DashboardPage() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }

    api.get('/complaints/my-complaints')
      .then(res => setComplaints(res.data))
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navbar */}
      <header className="bg-white border-b border-neutral-200 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-neutral-900 text-white flex justify-center items-center">
            <MessageSquareWarning className="size-4" />
          </div>
          <span className="font-bold">GrievanceOS</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/map">
            <Button variant="outline" size="sm">Live Map</Button>
          </Link>
          <Link href="/complaints/new">
            <Button size="sm" className="bg-neutral-900 text-white gap-1">
              <Plus className="size-4" /> New Complaint
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="size-4" />
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">My Complaints</h1>
          <p className="text-neutral-500 text-sm mt-1">Track all your filed complaints</p>
        </div>

        {loading && (
          <p className="text-neutral-500 text-sm">Loading complaints...</p>
        )}

        {!loading && complaints.length === 0 && (
          <Card className="text-center py-16">
            <CardContent className="flex flex-col items-center gap-4">
              <MessageSquareWarning className="size-12 text-neutral-300" />
              <p className="text-neutral-500">No complaints filed yet</p>
              <Link href="/complaints/new">
                <Button className="bg-neutral-900 text-white gap-1">
                  <Plus className="size-4" /> File your first complaint
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col gap-4">
          {complaints.map((c: any) => (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{c.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[c.status] || ''}`}>
                      {c.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-neutral-500">
                    <span>{c.category}</span>
                    <span>·</span>
                    <span>{c.priority} priority</span>
                    <span>·</span>
                    <span>{new Date(c.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                {c.wardName && (
                  <Badge variant="outline" className="text-xs">{c.wardName}</Badge>
                )}
                {c.assignedOfficialName ? (
                  <span className="text-xs text-neutral-500">
                    👤 {c.assignedOfficialName}
                  </span>
                ) : (
                  <span className="text-xs text-neutral-400">Unassigned</span>
                )}
              </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}