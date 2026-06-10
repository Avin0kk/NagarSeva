'use client';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const getColor = (intensity: number) => {
  if (intensity === 0) return '#ccc';
  if (intensity < 0.25) return '#4ade80';
  if (intensity < 0.5) return '#fbbf24';
  if (intensity < 0.75) return '#f97316';
  return '#dc2626';
};

export default function HeatmapViewer({ wards }: { wards: any[] }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="h-full w-full bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded" />;
  }

  return (
    <MapContainer
      key="heatmap-map"
      center={[28.6139, 77.209]}
      zoom={11}
      style={{ height: '100%', width: '100%', borderRadius: '8px' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {wards.map((ward: any) => (
        <Circle
          key={ward.wardId}
          center={[ward.latitude, ward.longitude]}
          radius={5000}
          fillColor={getColor(ward.intensity)}
          color={getColor(ward.intensity)}
          weight={2}
          opacity={0.7}
          fillOpacity={0.5}
        >
          <Popup>
            <div className="text-sm space-y-1">
              <p className="font-semibold">{ward.wardName}</p>
              <div className="border-t pt-1">
                <p className="font-medium text-lg">
                  {ward.unresolvedCount} Pending
                </p>
                <div className="text-xs text-neutral-600 space-y-0.5 mt-1">
                  <p>🔵 In Progress: {ward.inProgressCount}</p>
                  <p>🟠 Escalated: {ward.escalatedCount}</p>
                </div>
              </div>
            </div>
          </Popup>
        </Circle>
      ))}
    </MapContainer>
  );
}