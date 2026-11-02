import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { JobCard, Customer, SiteCoordinates } from '../types';
import {
  MapPin,
  Navigation,
  Crosshair,
  Compass,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Filter,
  Wrench,
  Clock,
  Building,
  Layers,
} from 'lucide-react';

const GOOGLE_MAPS_API_KEY =
  (import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyCJerdOsOs8RKrK6QZ8xc8mcrpjxCNZZAc';

// Bangalore Central Service Depot / HQ default coordinates
export const DEFAULT_ENGINEER_COORDS: SiteCoordinates = {
  lat: 12.9845,
  lng: 77.7289,
  locationName: 'SMAART Depot & Service Base',
  address: 'Plot 104, Tech Park Zone II, Whitefield, Bengaluru 560066',
};

// Calculate Haversine distance in kilometers
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

interface MapControllerProps {
  centerCoords: { lat: number; lng: number };
  zoomLevel: number;
}

function MapController({ centerCoords, zoomLevel }: MapControllerProps) {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.panTo(centerCoords);
      map.setZoom(zoomLevel);
    }
  }, [map, centerCoords, zoomLevel]);
  return null;
}

export interface EngineerJobSitesMapProps {
  jobs: JobCard[];
  customers: Customer[];
  selectedJobId?: string | null;
  onSelectJob: (jobId: string) => void;
  onOpenInspection: (jobId: string) => void;
  currentEngineerLocation?: SiteCoordinates;
  isCompact?: boolean;
}

export const EngineerJobSitesMap: React.FC<EngineerJobSitesMapProps> = ({
  jobs,
  customers,
  selectedJobId,
  onSelectJob,
  onOpenInspection,
  currentEngineerLocation = DEFAULT_ENGINEER_COORDS,
  isCompact = true,
}) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'CRITICAL'>('ALL');
  const [mapType, setMapType] = useState<'roadmap' | 'hybrid'>('roadmap');
  const [hoveredJobId, setHoveredJobId] = useState<string | null>(null);

  // Match jobs with coordinate data (from job.siteCoordinates or customer.coordinates)
  const jobSitesWithCoords = useMemo(() => {
    return jobs
      .map(job => {
        const customer = customers.find(c => c.id === job.customerId);
        const coords = job.siteCoordinates || customer?.coordinates;

        // If coordinates not found, assign deterministic regional coordinates around Bengaluru
        let resolvedCoords = coords;
        if (!resolvedCoords) {
          // Fallback based on job index
          const fallbackOffsets = [
            { lat: 12.8399, lng: 77.677, name: 'Electronic City Diagnostics Bay' },
            { lat: 12.9784, lng: 77.7126, name: 'Whitefield Automation Hub' },
            { lat: 12.8124, lng: 77.6912, name: 'Bommasandra Precision Plant' },
            { lat: 12.9352, lng: 77.6245, name: 'Koramangala Biomedical Wing' },
          ];
          const hash = job.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const chosen = fallbackOffsets[hash % fallbackOffsets.length];
          resolvedCoords = {
            lat: chosen.lat,
            lng: chosen.lng,
            locationName: chosen.name,
            address: customer?.shippingAddress || 'Client On-Site Bay',
          };
        }

        const distanceKm = calculateDistanceKm(
          currentEngineerLocation.lat,
          currentEngineerLocation.lng,
          resolvedCoords.lat,
          resolvedCoords.lng
        );

        return {
          job,
          customer,
          coords: resolvedCoords,
          distanceKm,
        };
      })
      .filter(item => Boolean(item.coords));
  }, [jobs, customers, currentEngineerLocation]);

  // Filtered jobs for display
  const displayedSites = useMemo(() => {
    if (activeFilter === 'PENDING') {
      return jobSitesWithCoords.filter(
        item => item.job.status === 'ENGINEER_ASSIGNED' || item.job.status === 'REQUIREMENTS_LOGGED'
      );
    }
    if (activeFilter === 'CRITICAL') {
      return jobSitesWithCoords.filter(
        item => item.job.priority === 'CRITICAL' || item.job.priority === 'HIGH'
      );
    }
    return jobSitesWithCoords;
  }, [jobSitesWithCoords, activeFilter]);

  // Selected site data
  const currentSelectedSite = useMemo(() => {
    if (!selectedJobId) return displayedSites[0] || null;
    return jobSitesWithCoords.find(s => s.job.id === selectedJobId) || null;
  }, [selectedJobId, displayedSites, jobSitesWithCoords]);

  // Center coordinates: center on selected site or current engineer location
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(() => {
    if (currentSelectedSite?.coords) {
      return { lat: currentSelectedSite.coords.lat, lng: currentSelectedSite.coords.lng };
    }
    return { lat: currentEngineerLocation.lat, lng: currentEngineerLocation.lng };
  });
  const [mapZoom, setMapZoom] = useState<number>(11);

  // When selection changes, pan camera smoothly
  useEffect(() => {
    if (currentSelectedSite?.coords) {
      setMapCenter({
        lat: currentSelectedSite.coords.lat,
        lng: currentSelectedSite.coords.lng,
      });
      setMapZoom(13);
    }
  }, [currentSelectedSite?.job.id]);

  const handleRecenterEngineer = () => {
    setMapCenter({
      lat: currentEngineerLocation.lat,
      lng: currentEngineerLocation.lng,
    });
    setMapZoom(12);
  };

  const handleFitAllSites = () => {
    if (displayedSites.length > 0) {
      // Find average bounding center
      const avgLat =
        displayedSites.reduce((sum, s) => sum + s.coords.lat, currentEngineerLocation.lat) /
        (displayedSites.length + 1);
      const avgLng =
        displayedSites.reduce((sum, s) => sum + s.coords.lng, currentEngineerLocation.lng) /
        (displayedSites.length + 1);
      setMapCenter({ lat: avgLat, lng: avgLng });
      setMapZoom(11);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 rounded-3xl overflow-hidden relative select-none">
      {/* Top Map Control Bar */}
      <div className="px-3 py-2 bg-slate-900/95 backdrop-blur border-b border-slate-800 flex items-center justify-between text-xs z-10">
        {/* Filter Pills */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
              activeFilter === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Sites ({jobSitesWithCoords.length})
          </button>
          <button
            onClick={() => setActiveFilter('PENDING')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
              activeFilter === 'PENDING'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Active ({jobSitesWithCoords.filter(s => s.job.status === 'ENGINEER_ASSIGNED').length})
          </button>
          <button
            onClick={() => setActiveFilter('CRITICAL')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
              activeFilter === 'CRITICAL'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Critical
          </button>
        </div>

        {/* View mode toggle: Hybrid / Roadmap */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setMapType(prev => (prev === 'roadmap' ? 'hybrid' : 'roadmap'))}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold flex items-center gap-1"
            title="Toggle Satellite Imagery"
          >
            <Layers className="w-3 h-3 text-blue-400" />
            <span className="hidden xs:inline">{mapType === 'roadmap' ? 'Satellite' : 'Map'}</span>
          </button>
          <button
            onClick={handleRecenterEngineer}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400"
            title="Center on My Location"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Map Canvas */}
      <div className="flex-1 w-full min-h-[340px] relative bg-slate-950">
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={['marker']}>
          <Map
            mapId="DEMO_MAP_ID"
            mapTypeId={mapType}
            defaultCenter={mapCenter}
            defaultZoom={mapZoom}
            gestureHandling={'greedy'}
            disableDefaultUI={true}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
          >
            <MapController centerCoords={mapCenter} zoomLevel={mapZoom} />

            {/* Engineer Live Base Location Marker */}
            <AdvancedMarker
              position={{ lat: currentEngineerLocation.lat, lng: currentEngineerLocation.lng }}
              title="My Position (Field Base / Depot)"
            >
              <div className="relative flex items-center justify-center cursor-pointer group">
                <span className="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping"></span>
                <div className="relative w-7 h-7 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-white">
                  <Navigation className="w-3.5 h-3.5 rotate-45" />
                </div>
                <div className="absolute -bottom-5 px-1.5 py-0.5 rounded bg-slate-900/90 text-[9px] font-bold text-blue-300 border border-blue-500/40 whitespace-nowrap shadow-sm">
                  My Location
                </div>
              </div>
            </AdvancedMarker>

            {/* Job Site Markers */}
            {displayedSites.map(({ job, customer, coords, distanceKm }) => {
              const isSelected = selectedJobId === job.id;
              const isHovered = hoveredJobId === job.id;
              const isCritical = job.priority === 'CRITICAL';
              const isHigh = job.priority === 'HIGH';

              const badgeColor = isCritical
                ? 'bg-rose-600 border-rose-300 text-white'
                : isHigh
                ? 'bg-amber-500 border-amber-200 text-slate-950'
                : job.status === 'DELIVERED'
                ? 'bg-emerald-600 border-emerald-300 text-white'
                : 'bg-blue-600 border-blue-300 text-white';

              return (
                <AdvancedMarker
                  key={job.id}
                  position={{ lat: coords.lat, lng: coords.lng }}
                  onClick={() => onSelectJob(job.id)}
                  title={`${job.jobNumber} - ${customer?.companyName || 'Job Site'}`}
                >
                  <div
                    onMouseEnter={() => setHoveredJobId(job.id)}
                    onMouseLeave={() => setHoveredJobId(null)}
                    className={`relative flex flex-col items-center cursor-pointer transition-transform duration-200 ${
                      isSelected ? 'scale-115 z-30' : 'hover:scale-105 z-20'
                    }`}
                  >
                    {/* Pulsing halo for critical / active jobs */}
                    {isCritical && (
                      <span className="absolute -inset-1 rounded-full bg-rose-500/40 animate-ping"></span>
                    )}

                    {/* Marker Pin Head */}
                    <div
                      className={`flex items-center gap-1 px-2 py-1 rounded-full border-2 shadow-xl text-[10px] font-bold tracking-tight ${badgeColor}`}
                    >
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span>{job.jobNumber.replace('JC-2026-', '#')}</span>
                      <span className="text-[9px] opacity-90">({distanceKm}km)</span>
                    </div>

                    {/* Triangle pointer bottom */}
                    <div
                      className={`w-2 h-2 -mt-1 rotate-45 ${
                        isCritical
                          ? 'bg-rose-600'
                          : isHigh
                          ? 'bg-amber-500'
                          : job.status === 'DELIVERED'
                          ? 'bg-emerald-600'
                          : 'bg-blue-600'
                      }`}
                    ></div>

                    {/* Hover tooltip label */}
                    {(isSelected || isHovered) && (
                      <div className="absolute -top-7 px-2 py-0.5 rounded-md bg-slate-900/95 text-white border border-slate-700 text-[9px] font-semibold whitespace-nowrap shadow-lg">
                        {customer?.companyName || customer?.name}
                      </div>
                    )}
                  </div>
                </AdvancedMarker>
              );
            })}

            {/* InfoWindow on Selected Site */}
            {currentSelectedSite && (
              <InfoWindow
                position={{
                  lat: currentSelectedSite.coords.lat,
                  lng: currentSelectedSite.coords.lng,
                }}
                onCloseClick={() => onSelectJob('')}
                pixelOffset={[0, -28]}
              >
                <div className="p-1 max-w-[230px] text-slate-800 text-xs">
                  <div className="flex items-center justify-between mb-1 pb-1 border-b border-slate-200">
                    <span className="font-mono font-bold text-blue-600 text-[11px]">
                      {currentSelectedSite.job.jobNumber}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                        currentSelectedSite.job.priority === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800'
                          : currentSelectedSite.job.priority === 'HIGH'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {currentSelectedSite.job.priority}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-slate-900 leading-tight mb-0.5">
                    {currentSelectedSite.customer?.companyName || currentSelectedSite.customer?.name}
                  </h4>

                  <p className="text-[10px] text-slate-600 leading-snug line-clamp-2 mb-1.5">
                    {currentSelectedSite.coords.locationName || currentSelectedSite.coords.address}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-2 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                    <span className="font-mono">
                      {currentSelectedSite.coords.lat.toFixed(4)}°N, {currentSelectedSite.coords.lng.toFixed(4)}°E
                    </span>
                    <span className="font-bold text-blue-700">{currentSelectedSite.distanceKm} km away</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenInspection(currentSelectedSite.job.id)}
                      className="flex-1 py-1 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 shadow-xs transition"
                    >
                      <Wrench className="w-3 h-3" />
                      <span>{currentSelectedSite.job.status === 'ENGINEER_ASSIGNED' ? 'Inspect Site' : 'View Ticket'}</span>
                    </button>

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${currentSelectedSite.coords.lat},${currentSelectedSite.coords.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 px-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold flex items-center gap-0.5 transition"
                      title="Open in Google Maps Navigation"
                    >
                      <Navigation className="w-3 h-3 text-blue-600" />
                    </a>
                  </div>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>

        {/* Map Floating Control Overlay: Fit Bounds & Compass */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-20">
          <button
            onClick={handleFitAllSites}
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 shadow-md transition"
            title="Fit All Assigned Job Sites"
          >
            <Compass className="w-4 h-4 text-blue-400" />
          </button>
          <button
            onClick={handleRecenterEngineer}
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 shadow-md transition"
            title="Center on Engineer Location"
          >
            <Crosshair className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </div>

      {/* Bottom Drawer / Selected Job Preview Card inside Mobile View */}
      {currentSelectedSite && (
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-20 transition-all">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                  {currentSelectedSite.job.jobNumber}
                </span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    currentSelectedSite.job.status === 'ENGINEER_ASSIGNED'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  }`}
                >
                  {currentSelectedSite.job.status}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {currentSelectedSite.distanceKm} km from Base
                </span>
              </div>

              <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                {currentSelectedSite.customer?.companyName || currentSelectedSite.customer?.name}
              </h4>

              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                <span>
                  {currentSelectedSite.coords.locationName || currentSelectedSite.coords.address}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${currentSelectedSite.coords.lat},${currentSelectedSite.coords.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                title="Get Turn-by-Turn Navigation"
              >
                <Navigation className="w-4 h-4" />
              </a>

              <button
                onClick={() => onOpenInspection(currentSelectedSite.job.id)}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1"
              >
                <span>{currentSelectedSite.job.status === 'ENGINEER_ASSIGNED' ? 'Inspect' : 'Open'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
