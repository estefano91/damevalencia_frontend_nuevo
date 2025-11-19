import { useMemo } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

interface EventMapProps {
  latitude: number | string;
  longitude: number | string;
  placeName?: string;
  address?: string;
}

const EventMap = ({ latitude, longitude, placeName, address }: EventMapProps) => {
  // Convertir a números y validar
  let lat: number | null = null;
  let lng: number | null = null;

  if (latitude != null && latitude !== '') {
    lat = typeof latitude === 'string' ? parseFloat(latitude) : latitude;
  }
  if (longitude != null && longitude !== '') {
    lng = typeof longitude === 'string' ? parseFloat(longitude) : longitude;
  }

  // Validar que sean números finitos válidos
  const isValidLat = lat != null && typeof lat === 'number' && isFinite(lat) && !isNaN(lat) && lat >= -90 && lat <= 90;
  const isValidLng = lng != null && typeof lng === 'number' && isFinite(lng) && !isNaN(lng) && lng >= -180 && lng <= 180;

  const mapCenter = useMemo(() => {
    // Solo calcular si las coordenadas son válidas
    if (isValidLat && isValidLng && lat != null && lng != null) {
      return {
        lat: lat,
        lng: lng,
      };
    }
    // Esto no debería ejecutarse porque hay un return temprano, pero por seguridad
    return {
      lat: 39.4699,
      lng: -0.3763,
    };
  }, [lat, lng, isValidLat, isValidLng]);

  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: false,
      clickableIcons: true,
      scrollwheel: true,
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: true,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: true,
    }),
    []
  );

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Si las coordenadas no son válidas, mostrar mensaje o enlace
  if (!isValidLat || !isValidLng) {
    return (
      <div className="rounded-lg overflow-hidden border shadow-sm">
        <a
          href={
            address
              ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
              : 'https://maps.google.com'
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="w-full h-64 bg-muted flex items-center justify-center">
            <p className="text-sm text-muted-foreground text-center px-4">
              {address 
                ? `Click to view ${address} on Google Maps`
                : 'Click to view location on Google Maps'}
            </p>
          </div>
        </a>
      </div>
    );
  }

  if (!apiKey) {
    // Fallback a mapa estático si no hay API key (solo si las coordenadas son válidas)
    if (isValidLat && isValidLng && lat != null && lng != null) {
      const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=600x300&maptype=roadmap&markers=color:red%7C${lat},${lng}`;
      return (
        <div className="rounded-lg overflow-hidden border shadow-sm">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={staticMapUrl}
              alt={placeName || address || "Map preview"}
              className="w-full h-64 object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </a>
        </div>
      );
    }
    // Si no hay API key y las coordenadas no son válidas, mostrar enlace
    return (
      <div className="rounded-lg overflow-hidden border shadow-sm">
        <a
          href={
            address
              ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
              : 'https://maps.google.com'
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="w-full h-64 bg-muted flex items-center justify-center">
            <p className="text-sm text-muted-foreground text-center px-4">
              {address 
                ? `Click to view ${address} on Google Maps`
                : 'Click to view location on Google Maps'}
            </p>
          </div>
        </a>
      </div>
    );
  }

  // Solo renderizar el mapa si las coordenadas son válidas
  if (!isValidLat || !isValidLng || lat == null || lng == null) {
    return null; // Esto no debería ejecutarse por el return temprano, pero por seguridad
  }

  return (
    <LoadScript googleMapsApiKey={apiKey} loadingElement={<div className="w-full h-64 bg-muted animate-pulse" />}>
      <div className="rounded-lg overflow-hidden border shadow-sm">
        <GoogleMap
          mapContainerStyle={{
            width: "100%",
            height: "300px",
          }}
          center={mapCenter}
          zoom={15}
          options={mapOptions}
        >
          <Marker
            position={mapCenter}
            title={placeName || address || "Event location"}
          />
        </GoogleMap>
      </div>
    </LoadScript>
  );
};

export default EventMap;

