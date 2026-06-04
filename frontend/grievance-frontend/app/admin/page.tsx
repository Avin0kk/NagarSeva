'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { MessageSquareWarning, LogOut, AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

const statusColors: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  ESCALATED: 'bg-red-100 text-red-700',
  RESOLVED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-neutral-100 text-neutral-700',
};

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'complaints' | 'officials'>('overview');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    Promise.all([
      api.get('/complaints/admin/stats'),
      api.get('/complaints/admin/all-complaints'),
    ])
      .then(([statsRes, complaintsRes]) => {
        setStats(statsRes.data);
        setComplaints(complaintsRes.data);
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header className="bg-card border-b border-border px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary text-primary-foreground flex justify-center items-center">
            <MessageSquareWarning className="size-4" />
          </div>
          <span className="font-bold">GrievanceOS — Admin Dashboard</span>
        </div>
        <Button variant="ghost" size="sm" onClick={logout}>
          <LogOut className="size-4" />
        </Button>
        <ThemeToggle />
      </header>

      <main className="max-w-7xl mx-auto p-8">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 border-b border-border">
          <button
            onClick={() => setTab('overview')}
            className={`px-4 py-2 font-medium text-sm ${
              tab === 'overview'
                ? 'text-foreground border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setTab('complaints')}
            className={`px-4 py-2 font-medium text-sm ${
              tab === 'complaints'
                ? 'text-foreground border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All Complaints
          </button>
          <button
            onClick={() => setTab('officials')}
            className={`px-4 py-2 font-medium text-sm ${
              tab === 'officials'
                ? 'text-foreground border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Officials
          </button>
        </div>

        {loading ? (
          <p className="text-muted-foreground text-sm">Loading dashboard...</p>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {tab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-3xl font-bold">{stats?.total || 0}</p>
                        <p className="text-xs text-muted-foreground mt-1">Total Complaints</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-600/20 dark:border-blue-400/20 bg-blue-50 dark:bg-blue-950">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Clock className="size-5 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats?.open || 0}</p>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Open</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-yellow-600/20 dark:border-yellow-400/20 bg-yellow-50 dark:bg-yellow-950">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <TrendingUp className="size-5 mx-auto mb-1 text-yellow-600 dark:text-yellow-400" />
                        <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats?.inProgress || 0}</p>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">In Progress</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-red-600/20 dark:border-red-400/20 bg-red-50 dark:bg-red-950">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <AlertCircle className="size-5 mx-auto mb-1 text-red-600 dark:text-red-400" />
                        <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats?.escalated || 0}</p>
                        <p className="text-xs text-red-700 dark:text-red-300 mt-1">Escalated</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-green-600/20 dark:border-green-400/20 bg-green-50 dark:bg-green-950">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <CheckCircle className="size-5 mx-auto mb-1 text-green-600 dark:text-green-400" />
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats?.resolved || 0}</p>
                        <p className="text-xs text-green-700 dark:text-green-300 mt-1">Resolved</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Resolution Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className="bg-green-600 dark:bg-green-400 h-3 rounded-full transition-all"
                        style={{
                          width: `${stats?.total ? Math.round((stats.resolved / stats.total) * 100) : 0}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {stats?.total ? Math.round((stats.resolved / stats.total) * 100) : 0}% of complaints resolved
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* COMPLAINTS TAB */}
            {tab === 'complaints' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">All Complaints</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-3 font-medium">Title</th>
                        <th className="text-left py-3 px-3 font-medium">Category</th>
                        <th className="text-left py-3 px-3 font-medium">Status</th>
                        <th className="text-left py-3 px-3 font-medium">Priority</th>
                        <th className="text-left py-3 px-3 font-medium">Ward</th>
                        <th className="text-left py-3 px-3 font-medium">Official</th>
                        <th className="text-left py-3 px-3 font-medium">Filed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complaints.map((c: any) => (
                        <tr key={c.id} className="border-b border-border hover:bg-muted/50">
                          <td className="py-3 px-3 font-medium text-xs">{c.title}</td>
                          <td className="py-3 px-3 text-xs text-muted-foreground">{c.category}</td>
                          <td className="py-3 px-3">
                            <Badge className={`text-xs font-medium ${statusColors[c.status] || ''}`}>
                              {c.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-3 text-xs">{c.priority}</td>
                          <td className="py-3 px-3 text-xs text-muted-foreground">{c.wardName || '—'}</td>
                          <td className="py-3 px-3 text-xs text-muted-foreground">{c.assignedOfficialName || '—'}</td>
                          <td className="py-3 px-3 text-xs text-muted-foreground">
                            {new Date(c.createdAt).toLocaleDateString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {complaints.length === 0 && (
                    <p className="text-center py-8 text-muted-foreground text-sm">No complaints found</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* OFFICIALS TAB */}
            {tab === 'officials' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Rajesh Kumar', email: 'official.central@grievanceos.in', ward: 'Ward 1 - Central Delhi', complaints: 2 },
                  { name: 'Priya Sharma', email: 'official.north@grievanceos.in', ward: 'Ward 2 - North Delhi', complaints: 1 },
                  { name: 'Amit Singh', email: 'official.south@grievanceos.in', ward: 'Ward 3 - South Delhi', complaints: 4 },
                  { name: 'Neha Gupta', email: 'official.east@grievanceos.in', ward: 'Ward 4 - East Delhi', complaints: 0 },
                  { name: 'Vikram Yadav', email: 'official.west@grievanceos.in', ward: 'Ward 5 - West Delhi', complaints: 1 },
                  { name: 'Sunita Verma', email: 'official.gurgaon@grievanceos.in', ward: 'Ward 6 - Gurgaon', complaints: 2 },
                  { name: 'Rohit Mehta', email: 'official.noida@grievanceos.in', ward: 'Ward 7 - Noida', complaints: 0 },
                  { name: 'Kavita Joshi', email: 'official.faridabad@grievanceos.in', ward: 'Ward 8 - Faridabad', complaints: 0 },
                ].map((official) => (
                  <Card key={official.email}>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold text-sm">{official.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{official.email}</p>
                      <p className="text-xs text-muted-foreground mt-2">{official.ward}</p>
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs">
                          <span className="font-medium">{official.complaints}</span>
                          <span className="text-muted-foreground"> complaints assigned</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}