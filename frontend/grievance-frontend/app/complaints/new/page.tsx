'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquareWarning, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const PinSelector = dynamic(() => import('@/components/ui/PinSelector'), 
                            { ssr: false }
                          );
                        

export default function NewComplaintPage() {
  const router = useRouter();

  // STATE — one for each form field
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('POTHOLE');
  const [priority, setPriority] = useState('MEDIUM');
  const [addressText, setAddressText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [showMap,setShowMap] = useState(false); 

  const getLocation = () => {

    navigator.geolocation.getCurrentPosition( (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
    }
    ,(error) => {
        console.error(error);
        alert("Unable to get location");
    }
    );
  };

  const handleSubmit = async () => {
    if (!title || !description) {
      setError('Title and description are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/complaints/create-complaint', {
        title,
        description,
        complaintCategory: category,
        priority,
        addressText,
        latitude,
        longitude
      });
      router.push('/dashboard');
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to file complaint');
    } finally {
      setLoading(false);
    }
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
      </header>

      <main className="max-w-2xl mx-auto p-8">
        <Link href="/dashboard" className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 mb-6">
          <ArrowLeft className="size-4" /> Back to dashboard
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">File a Complaint</CardTitle>
            <p className="text-neutral-500 text-sm">Report a civic issue in your area</p>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Title field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Title</label>
              <input
                placeholder="e.g. Large pothole near bus stop"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="border border-neutral-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            {/* Description field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Description</label>
              <textarea
                rows={4}
                placeholder="Provide more details about the issue"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="border border-neutral-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            {/* Category dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="border border-neutral-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-neutral-900"
              >
                <option value="POTHOLE">Pothole</option>
                <option value="WATER">Water</option>
                <option value="POWER">Power</option>
                <option value="GARBAGE">Garbage</option>
                <option value="STREETLIGHT">Streetlight</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* Priority dropdown */}
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Priority</label>
                <select
                    value={priority}
                    onChange={e => setPriority(e.target.value)}
                    className="border border-neutral-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-neutral-900"
                    >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                </select>
            </div>

            {/* Address */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Address</label>
              <input
                placeholder="e.g. Near main market gate, Sector 5"
                value={addressText}
                onChange={e => setAddressText(e.target.value)}
                className="border border-neutral-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            {/* Location */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">GPS Location</label>
              <div className="flex gap-2 items-center">
                <Button type="button" variant="outline" onClick={getLocation}>
                  📍 Use My Location
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowMap(!showMap)}>
                  Select on Map
                </Button>
              </div>
              
              {/* Move map OUTSIDE the flex row */}
              {showMap && (
                <div className="mt-2 rounded-lg overflow-hidden border border-neutral-200">
                  <PinSelector onSelect={(lat, lng) => {
                    setLatitude(lat);
                    setLongitude(lng);
                    setShowMap(false); // hide map after selecting
                  }} />
                </div>
              )}

              {latitude && longitude && (
                <p className="text-sm text-neutral-600 mt-1">
                  📍 {latitude.toFixed(5)}, {longitude.toFixed(5)}
                </p>
              )}
            </div>


            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-neutral-900 text-white mt-2"
            >
              {loading ? 'Filing complaint...' : 'Submit Complaint'}
            </Button>

          </CardContent>
        </Card>
      </main>
    </div>
  );
}