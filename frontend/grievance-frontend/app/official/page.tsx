'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { MessageSquareWarning, LogOut, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

const statusColors: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  ESCALATED: 'bg-red-100 text-red-700',
  RESOLVED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-neutral-100 text-neutral-700',
};

export default function OfficialPage() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<Record<string, string>>({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }

    api.get('/complaints/official/queue')
      .then(res => {
        setComplaints(res.data);
        // pre-fill the dropdown with each complaint's current status
        const initial: Record<string, string> = {};
        res.data.forEach((c: any) => { initial[c.id] = c.status; });
        setSelectedStatuses(initial);
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string) => {
    const newStatus = selectedStatuses[id];
    if (!newStatus) return;
    setUpdatingId(id);
    try {
      await api.patch(`/complaints/${id}/status`, {
        status: newStatus,
        note: 'Updated by official'
      });
      setComplaints(prev =>
        prev.map(c => c.id === id ? { ...c, status: newStatus } : c)
      );
    } catch (e) {
      console.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-card border-b border-border px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-neutral-900 text-white flex justify-center items-center">
            <MessageSquareWarning className="size-4" />
          </div>
          <span className="font-bold">GrievanceOS — Official Queue</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/map">
            <Button variant="outline" size="sm">Live Map</Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="size-4" />
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Complaint Queue</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Sorted by SLA urgency — resolve before deadline
          </p>
        </div>

        {loading && <p className="text-muted-foreground text-sm">Loading queue...</p>}

        <div className="flex flex-col gap-4">
          {complaints.map((c: any) => (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex flex-col gap-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{c.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[c.status] || ''}`}>
                        {c.status}
                      </span>
                      {c.status === 'ESCALATED' && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700 flex items-center gap-1">
                          <Clock className="size-3" /> SLA breached
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span>{c.category}</span>
                      <span>·</span>
                      <span>{c.priority} priority</span>
                      <span>·</span>
                      <span>{new Date(c.createdAt).toLocaleDateString('en-IN')}</span>
                      {c.slaDeadline && (
                        <>
                          <span>·</span>
                          <span className="text-orange-500 font-medium">
                            Due: {new Date(c.slaDeadline).toLocaleString('en-IN')}
                          </span>
                        </>
                      )}
                    </div>
                    {c.addressText && (
                      <p className="text-xs text-muted-foreground/70 mt-1">{c.addressText}</p>
                    )}
                  </div>

                  {c.status !== 'RESOLVED' && c.status !== 'CLOSED' && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <select
                        value={selectedStatuses[c.id] || c.status}
                        onChange={e => setSelectedStatuses(prev => ({
                          ...prev,
                          [c.id]: e.target.value
                        }))}
                        className="border border-border rounded-lg bg-background px-2 py-1.5 text-xs text-foreground outline-none"
                      >
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                      <Button
                        size="sm"
                        disabled={updatingId === c.id}
                        onClick={() => updateStatus(c.id)}
                        className="bg-primary text-primary-foreground text-xs px-3"
                      >
                        {updatingId === c.id ? 'Saving...' : 'Update'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {!loading && complaints.length === 0 && (
            <Card className="text-center py-16">
              <CardContent className="flex flex-col items-center gap-2">
                <p className="text-neutral-500">No complaints in your queue</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}