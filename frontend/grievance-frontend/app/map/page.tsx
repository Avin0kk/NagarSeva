'use client';
import dynamic from 'next/dynamic';
import { MessageSquareWarning } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';

const MapView = dynamic(() => import('@/components/Mapview'), { ssr: false });

export default function MapPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="bg-card border-b border-border px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary text-primary-foreground flex justify-center items-center">
            <MessageSquareWarning className="size-4" />
          </div>
          <span className="font-bold">GrievanceOS — Live Map</span>
        </div>
        <div className="flex gap-2 items-center">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">Dashboard</Button>
          </Link>
          <Link href="/complaints/new">
            <Button size="sm" className="bg-primary text-primary-foreground">+ File Complaint</Button>
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <div className="flex-1">
        <MapView />
      </div>
    </div>
  );
}