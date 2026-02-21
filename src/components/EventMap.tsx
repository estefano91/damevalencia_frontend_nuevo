import { MapPin, ExternalLink } from "lucide-react";

interface EventMapProps {
  latitude: number | string;
  longitude: number | string;
  placeName?: string;
  address?: string;
}

/**
 * Bloque clicable que abre la ubicación en Google Maps (sin API key ni coste).
 */
const EventMap = ({ latitude, longitude, placeName, address }: EventMapProps) => {
  let lat: number | null = null;
  let lng: number | null = null;

  if (latitude != null && latitude !== "") {
    lat = typeof latitude === "string" ? parseFloat(latitude) : latitude;
  }
  if (longitude != null && longitude !== "") {
    lng = typeof longitude === "string" ? parseFloat(longitude) : longitude;
  }

  const isValidLat = lat != null && typeof lat === "number" && isFinite(lat) && !isNaN(lat) && lat >= -90 && lat <= 90;
  const isValidLng = lng != null && typeof lng === "number" && isFinite(lng) && !isNaN(lng) && lng >= -180 && lng <= 180;

  const mapsUrl =
    isValidLat && isValidLng && lat != null && lng != null
      ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
      : address
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
        : "https://maps.google.com";

  const displayText = placeName || address || null;

  return (
    <div className="rounded-lg overflow-hidden border border-stone-200 dark:border-stone-700 shadow-sm">
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center justify-center w-full h-[300px] min-h-[200px] bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-800 dark:to-stone-900 hover:from-stone-200 hover:to-stone-300 dark:hover:from-stone-700 dark:hover:to-stone-800 transition-colors group"
      >
        <MapPin className="h-12 w-12 text-purple-500 dark:text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
        {displayText && (
          <p className="text-sm font-medium text-stone-700 dark:text-stone-300 text-center px-4 max-w-md line-clamp-2">
            {displayText}
          </p>
        )}
        <span className="mt-2 inline-flex items-center gap-1.5 text-sm text-purple-600 dark:text-purple-400 font-medium">
          <ExternalLink className="h-4 w-4" />
          Ver ubicación en Google Maps
        </span>
      </a>
    </div>
  );
};

export default EventMap;
