'use client';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '@/lib/axios';

// Fix default marker icons broken in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Coloured icons for different statuses
const getIcon = (status: string) => {
  const colors: Record<string, string> = {
    OPEN: 'red',
    IN_PROGRESS: 'orange', 
    ESCALATED: 'violet',
    RESOLVED: 'green',
  };
  const color = colors[status] || 'blue';
  return L.divIcon({
    className: '',
    html: `<div style="
      width:14px;height:14px;
      background:${color};
      border:2px solid white;
      border-radius:50%;
      box-shadow:0 1px 4px rgba(0,0,0,0.4)
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
};

export default function MapView() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/complaints/map')
      .then(res => setComplaints(res.data))
      .catch(err => console.error('Map fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ height: 'calc(100vh - 65px)', width: '100%', position: 'relative' }}>
      {loading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-card px-4 py-2 rounded-full shadow text-sm text-card-foreground ring-1 ring-ring/10">
          Loading complaints...
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-8 right-4 z-[1000] bg-card rounded-xl shadow-lg p-4 flex flex-col gap-2 ring-1 ring-ring/10 text-card-foreground">
        <p className="text-xs font-semibold text-card-foreground/80 mb-1">Status</p>
        {[
          { color: 'red', label: 'Open' },
          { color: 'orange', label: 'In Progress' },
          { color: 'violet', label: 'Escalated' },
          { color: 'green', label: 'Resolved (last 24h)' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: color, border: '2px solid var(--background)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
            <span className="text-xs text-card-foreground/70">{label}</span>
          </div>
        ))}
      </div>

      {/* Complaint count */}
      <div className="absolute top-4 left-4 z-[1000] bg-card rounded-xl shadow px-4 py-2 ring-1 ring-ring/10 text-card-foreground">
        <p className="text-sm font-medium">{complaints.length} complaints on map</p>
      </div>

      <MapContainer
        center={[28.63, 77.21]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {complaints.map((c: any) => (
          c.latitude && c.longitude ? (
            <Marker
              key={c.id}
              position={[c.latitude, c.longitude]}
              icon={getIcon(c.status)}
            >
              <Popup>
                <div className="flex flex-col gap-1 min-w-[180px]">
                  <p className="font-semibold text-sm">{c.title}</p>
                  <p className="text-xs text-card-foreground/70">{c.category} · {c.priority}</p>
                  <p className="text-xs text-card-foreground/70">{c.addressText}</p>
                  <span className={`text-xs font-medium mt-1 ${
                    c.status === 'RESOLVED' ? 'text-green-600' :
                    c.status === 'ESCALATED' ? 'text-red-600' : 'text-blue-600'
                  }`}>{c.status}</span>
                </div>
              </Popup>
            </Marker>
          ) : null
        ))}
      </MapContainer>
    </div>
  );
}