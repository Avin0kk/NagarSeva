'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { MessageSquareWarning, LogOut, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import ThemeToggle from "@/components/ThemeToggle";
import stompClient from "@/lib/websocket";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-700 dark:bg-blue-200/20 dark:text-blue-200',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-200/20 dark:text-yellow-200',
  ESCALATED: 'bg-red-100 text-red-700 dark:bg-red-200/20 dark:text-red-200',
  RESOLVED: 'bg-green-100 text-green-700 dark:bg-green-200/20 dark:text-green-200',
  CLOSED: 'bg-muted text-muted-foreground',
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

  useEffect(() => {
  stompClient.onConnect = () => {
    console.log("✅ User WebSocket Connected");

    stompClient.subscribe(
      "/topic/complaints",
      (message) => {
        const notification = JSON.parse(message.body);

        // console.log(
        //   "📢 User Notification:",
        //   notification
        // );

        toast(notification.title, {
          description: notification.message,
        });
          
      }
    );
  };

  stompClient.activate();

  return () => {
    stompClient.deactivate();
  };
}, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="bg-card border-b border-border px-8 py-4 flex justify-between items-center">
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
        <ThemeToggle />
      </header>

      <main className="max-w-4xl mx-auto p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">My Complaints</h1>
          <p className="text-muted-foreground text-sm mt-1">Track all your filed complaints</p>
        </div>

        {loading && (
          <p className="text-muted-foreground text-sm">Loading complaints...</p>
        )}

        {!loading && complaints.length === 0 && (
          <Card className="text-center py-16">
            <CardContent className="flex flex-col items-center gap-4">
              <MessageSquareWarning className="size-12 text-card-foreground/50" />
              <p className="text-muted-foreground">No complaints filed yet</p>
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
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
                  <span className="text-xs text-muted-foreground">
                    👤 {c.assignedOfficialName}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground/70">Unassigned</span>
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