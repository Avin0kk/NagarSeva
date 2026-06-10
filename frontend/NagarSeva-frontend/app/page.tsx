'use client';

import { MessageSquareWarning, ArrowRight, PlayCircle, CheckCircle2, FileText, Route, Activity, BarChart3, ShieldCheck, Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import ThemeToggle from '@/components/ThemeToggle';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';

const MapView = dynamic(() => import('@/components/Mapview'), { ssr: false });

export default function Home() {
  const [recentResolved, setRecentResolved] = useState<any[]>([]);

    useEffect(() => {
      api.get('complaints/map/recent-resolved')
      .then(res => setRecentResolved(res.data))
      .catch(err => console.error('Error fetching resolved:', err));
    }, []);

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Navbar */}
      <header className="border-b border-border w-full">
        <div className="flex px-12 py-4 justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-neutral-900 text-white flex justify-center items-center">
              <MessageSquareWarning className="size-5" />
            </div>
            <span className="font-bold text-lg">NagarSeva</span>
          </div>
          <nav className="flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">Features</a>
            <a href="#how" className="text-sm text-muted-foreground hover:text-foreground">How It Works</a>
            <a href="#map" className="text-sm text-muted-foreground hover:text-foreground">Live Map</a>
            <a href="/heatmap" className="text-sm text-muted-foreground hover:text-foreground">Heatmap</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" className="text-sm">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-neutral-900 text-white text-sm">Get Started</Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="p-12">
        {/* Hero */}
        <section className="flex items-center gap-8 mb-16">
    {/* Left - Text Content */}
    <div className="flex flex-col flex-1 gap-6">
      <Badge variant="secondary" className="rounded-full px-3 py-1 w-fit">
        🏛️ Civic Tech for India
      </Badge>
      <h1 className="font-bold text-5xl tracking-tight leading-tight">
        Report civic issues,<br />
        <span className="text-muted-foreground">get them resolved.</span>
      </h1>
      <p className="max-w-xl text-muted-foreground text-lg">
        NagarSeva lets citizens file geo-tagged complaints about potholes, power cuts, garbage and more. Officials respond. SLA timers ensure accountability.
      </p>
      <div className="flex items-center gap-4">
        <Link href="/register">
          <Button className="bg-neutral-900 text-white px-6 gap-2">
            File a Complaint <ArrowRight className="size-4" />
          </Button>
        </Link>
        <Link href="/map">
          <Button variant="outline" className="px-6 gap-2">
            <PlayCircle className="size-4" /> View Live Map
          </Button>
        </Link>
      </div>
      <div className="flex pt-2 items-center gap-8">
        <div className="flex flex-col">
          <span className="font-bold text-2xl">48h</span>
          <span className="text-muted-foreground text-sm">SLA guarantee</span>
        </div>
        <Separator orientation="vertical" className="h-10" />
        <div className="flex flex-col">
          <span className="font-bold text-2xl">Live</span>
          <span className="text-muted-foreground text-sm">Map tracking</span>
        </div>
        <Separator orientation="vertical" className="h-10" />
        <div className="flex flex-col">
          <span className="font-bold text-2xl">Auto</span>
          <span className="text-muted-foreground text-sm">Escalation</span>
        </div>
      </div>
    </div>

    {/* Center - Recently Resolved */}
    <div className="flex flex-col gap-2 flex-1 items-center">
      <h3 className="font-semibold text-sm">Recently Resolved</h3>
      {recentResolved.slice(0, 2).map((complaint: any) => (
        <Card key={complaint.id} className="shadow-sm w-full">
          <CardContent className="flex p-3 items-center gap-2">
            <div className="size-8 rounded-full bg-green-600 text-white flex justify-center items-center flex-shrink-0">
              <CheckCircle2 className="size-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-xs truncate">{complaint.title}</span>
              <span className="text-muted-foreground text-xs">{complaint.wardName}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Right - Map */}
    <div className="flex flex-col gap-3 items-center flex-1">
      <div className="rounded-3xl border border-border overflow-hidden bg-muted/70 h-96 w-96">
        <MapView />
      </div>
      <p className="text-center text-muted-foreground text-sm font-medium">
        📍 Live Complaint Map
      </p>
    </div>
  </section>

        {/* Features */}
        <section id="features" className="flex flex-col gap-8 mb-16">
          <div className="text-center flex flex-col items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1">Features</Badge>
            <h2 className="font-bold text-3xl tracking-tight">Built for civic accountability</h2>
            <p className="max-w-2xl text-muted-foreground">Every feature designed to make government services more transparent and responsive.</p>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {[
              { icon: FileText, title: 'Geo-tagged Filing', desc: 'Drop a pin on the map to file your complaint. Ward is auto-assigned based on your location.' },
              { icon: Route, title: 'Smart Ward Routing', desc: 'PostGIS automatically assigns complaints to the right ward official based on GPS coordinates.' },
              { icon: Activity, title: 'SLA Timer Engine', desc: 'Every complaint has a 48-hour deadline. Breach it and it auto-escalates to senior officials.' },
              { icon: BarChart3, title: 'Resolution Heatmap', desc: 'See which areas have the most unresolved complaints with a live ward-level heatmap.' },
              { icon: ShieldCheck, title: 'JWT Auth + RBAC', desc: 'Citizen, Official, and Admin roles with secure JWT authentication and refresh tokens.' },
              { icon: Bell, title: 'Live WebSocket Updates', desc: 'Citizens get real-time notifications the moment an official updates their complaint status.' },
            ].map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="p-6 gap-4">
                <CardHeader className="p-0 gap-2">
                  <div className="size-11 rounded-xl bg-muted text-foreground flex justify-center items-center">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle className="text-lg">{title}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-muted-foreground text-sm">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="flex flex-col gap-8 mb-16">
          <div className="text-center flex flex-col items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1">How It Works</Badge>
            <h2 className="font-bold text-3xl tracking-tight">Three steps to resolution</h2>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {[
              { n: '1', title: 'File a complaint', desc: 'Drop a GPS pin, describe the issue, attach a photo. Ward is assigned automatically.' },
              { n: '2', title: 'Official responds', desc: 'The ward official sees it in their queue sorted by SLA urgency and updates the status.' },
              { n: '3', title: 'Get it resolved', desc: 'You get a live notification. If the SLA is breached, it escalates automatically.' },
            ].map(({ n, title, desc }) => (
              <div key={n} className="rounded-2xl border border-border flex p-6 flex-col gap-3">
                <div className="size-9 font-bold rounded-full bg-neutral-900 text-white text-sm flex justify-center items-center">{n}</div>
                <h3 className="font-semibold text-lg">{title}</h3>
                <p className="text-muted-foreground text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section>
          <Card className="bg-neutral-900 text-white p-12">
            <CardContent className="flex p-0 justify-between items-center gap-8">
              <div className="flex flex-col gap-3">
                <h2 className="font-bold text-3xl tracking-tight">Ready to fix your city?</h2>
                <p className="max-w-xl text-white/80">Join NagarSeva and hold your local government accountable with transparent, geo-tracked complaint resolution.</p>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/register">
                  <Button variant="secondary" className="px-6 gap-2">
                    File a Complaint <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <Link href="/map">
                  <Button variant="outline" className="bg-transparent text-white border-white/30 px-6">
                    View Live Map
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t border-border px-12 py-8 mt-12">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-neutral-900 text-white flex justify-center items-center">
              <MessageSquareWarning className="size-4" />
            </div>
            <span className="font-bold">NagarSeva</span>
          </div>
          <p className="text-muted-foreground text-sm">Built with Spring Boot · PostgreSQL + PostGIS · Redis · Next.js</p>
        </div>
        <Separator className="my-6" />
        <p className="text-center text-muted-foreground text-xs">© 2026 NagarSeva. Civic tech for a better India.</p>
      </footer>
    </div>
  );
}