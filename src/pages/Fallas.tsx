import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./Fallas.css";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, MapPin, Flame, AlertCircle, Search, Filter } from "lucide-react";

const VALENCIA_CENTER: [number, number] = [39.4699, -0.3763];
const ODS_API =
  "https://valencia.opendatasoft.com/api/records/1.0/search/?dataset=falles-fallas&rows=500";

export interface FallaRecord {
  id: string;
  id_falla?: number;
  nombre: string;
  seccion: string;
  artista?: string;
  fallera?: string;
  presidente?: string;
  direccion?: string;
  lat: number;
  lng: number;
}

// Fallas DAME destacadas: id_falla → etiqueta y enlace al evento
const DAME_FALLAS: Record<number, { label: string; link: string }> = {
  243: { label: "FALLA DAME 14/03", link: "https://damevalencia.com/eventos/las-fallas-dame" },
  236: { label: "FALLA DAME 15/03", link: "https://damevalencia.com/eventos/dame-casino-fallas" },
  244: { label: "FALLA DAME 16/03", link: "https://damevalencia.com/eventos/el-baile-nunca-falla" },
};

// Fallback estático si la API falla por CORS u otro motivo
const FALLBACK_FALLAS: FallaRecord[] = [
  { id: "dame-243", id_falla: 243, nombre: "FALLA DAME 14/03", seccion: "DAME", lat: 39.472, lng: -0.378 },
  { id: "dame-236", id_falla: 236, nombre: "FALLA DAME 15/03", seccion: "DAME", lat: 39.467, lng: -0.372 },
  { id: "dame-244", id_falla: 244, nombre: "FALLA DAME 16/03", seccion: "DAME", lat: 39.461, lng: -0.376 },
  { id: "1", nombre: "Convent Jerusalem - Matemàtic Marzal", seccion: "Secció Especial", artista: "Ximo Martínez", fallera: "Blanca Macarro", presidente: "Alfredo Forriols", lat: 39.4667, lng: -0.373 },
  { id: "2", nombre: "Fèlix Pizcueta-Ciril Amorós", seccion: "2A", artista: "Ximo Martí Fernández", fallera: "Blanca Macarro Miñana", presidente: "Alfredo Forriols Pajarón", lat: 39.4667, lng: -0.3729 },
  { id: "3", nombre: "Cuba - Literat Azorín", seccion: "1A", artista: "Arturo Castillo", fallera: "Paula Roca", presidente: "Ángel Sanchis", lat: 39.464, lng: -0.378 },
  { id: "4", nombre: "L'Arbol - Sueca - Literat Azorín", seccion: "1A", artista: "David Sánchez", fallera: "Rocío Gómez", presidente: "Raúl Bayo", lat: 39.468, lng: -0.382 },
  { id: "5", nombre: "Na Jordana", seccion: "Secció Especial", artista: "Salvador Cobos", fallera: "Malena López", presidente: "Jorge Pastor", lat: 39.472, lng: -0.385 },
  { id: "6", nombre: "Azcàrraga-Ferran el Catòlic", seccion: "3B", artista: "José Ramón Lisarde Ferrer", fallera: "Malena López Carbonell", presidente: "Jorge Pastor La Roda", lat: 39.4745, lng: -0.388 },
  { id: "7", nombre: "Cadis-Dènia", seccion: "3B", artista: "Víctor Navarro Granero", fallera: "Paula Roca Moreno", presidente: "Ángel Sanchis Santisteban", lat: 39.4632, lng: -0.3746 },
  { id: "8", nombre: "General Pando-Serrano Flores", seccion: "4B", artista: "Mauricio Moreira Santos", fallera: "Rocío Gómez Ramírez-Magenti", presidente: "Raúl Bayo Moreno", lat: 39.4732, lng: -0.3602 },
  { id: "9", nombre: "Barraca-Església del Rosari", seccion: "4C", artista: "Lorenzo Fandos Ayoro", fallera: "Alba Esteve Valenzuela", presidente: "José Antonio Pérez Ruiz", lat: 39.4658, lng: -0.3296 },
  { id: "10", nombre: "Plaza del Pilar", seccion: "2B", artista: "Antonio Marín", fallera: "Laura Martínez", presidente: "Carlos García", lat: 39.468, lng: -0.375 },
  { id: "11", nombre: "Plaza del Ayuntamiento", seccion: "Secció Especial", artista: "Vicent Martínez", fallera: "María Fernández", presidente: "Juan Pérez", lat: 39.4695, lng: -0.3763 },
  { id: "12", nombre: "Plaza de la Reina", seccion: "1B", artista: "Paco López", fallera: "Ana García", presidente: "Pedro Sánchez", lat: 39.470, lng: -0.3755 },
  { id: "13", nombre: "Mercat Central", seccion: "2A", artista: "David Martín", fallera: "Elena Ruiz", presidente: "Miguel Torres", lat: 39.473, lng: -0.381 },
  { id: "14", nombre: "Colón", seccion: "4A", artista: "Luis Fernández", fallera: "Carmen López", presidente: "Andrés Martínez", lat: 39.467, lng: -0.365 },
  { id: "15", nombre: "Ruzafa", seccion: "5A", artista: "Javier Moreno", fallera: "Sara Díaz", presidente: "Roberto Navarro", lat: 39.458, lng: -0.372 },
];

function CentrarButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="absolute bottom-4 left-4 z-[1000] bg-white dark:bg-gray-800 shadow-md"
    >
      <MapPin className="h-4 w-4 mr-1" />
      Valencia
    </Button>
  );
}

function MapController({ onCenter }: { onCenter: () => void }) {
  const map = useMap();
  const handleCenter = useCallback(() => {
    map.setView(VALENCIA_CENTER, 11);
    onCenter();
  }, [map, onCenter]);
  useEffect(() => {
    (window as any).__fallasCenterFn = handleCenter;
    return () => {
      delete (window as any).__fallasCenterFn;
    };
  }, [handleCenter]);
  return null;
}

// Tipo de marcador: dame (eventos DAME), special (Secció Especial / 1A), normal
const createFallaIcon = (type: "dame" | "special" | "normal") => {
  if (type === "dame") {
    return L.divIcon({
      className: "falla-marker-dame",
      html: '<span style="font-size:30px;line-height:1;display:block;text-align:center;filter:drop-shadow(0 0 5px #f97316)">🔥</span>',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });
  }
  if (type === "special") {
    return L.divIcon({
      className: "falla-marker-special",
      html: '<span style="font-size:26px;line-height:1;display:block;text-align:center;filter:drop-shadow(0 0 5px #2563eb) drop-shadow(0 0 8px #3b82f6)">🔥</span>',
      iconSize: [34, 34],
      iconAnchor: [17, 34],
    });
  }
  return L.divIcon({
    className: "falla-marker-custom",
    html: '<span style="font-size:20px;line-height:1;display:block;text-align:center">🔥</span>',
    iconSize: [26, 26],
    iconAnchor: [13, 26],
  });
};

const Fallas = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [fallas, setFallas] = useState<FallaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sectionFilter, setSectionFilter] = useState<string>("all");
  const [soloDame, setSoloDame] = useState(false);

  const fetchFallas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(ODS_API);
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const records = (data.records || []) as Array<{
        recordid?: string;
        fields?: {
          id_falla?: number;
          nombre?: string;
          seccion?: string;
          artista?: string;
          fallera?: string;
          presidente?: string;
          geo_point_2d?: [number, number];
        };
        geometry?: { coordinates: [number, number] };
      }>;
      const list: FallaRecord[] = records
        .filter((r) => {
          const pt = r.fields?.geo_point_2d ?? r.geometry?.coordinates?.slice().reverse();
          return pt && pt.length >= 2 && pt[0] > 0 && pt[1] !== 0;
        })
        .map((r) => {
          const pt = r.fields?.geo_point_2d ?? (r.geometry?.coordinates ? [r.geometry.coordinates[1], r.geometry.coordinates[0]] as [number, number] : [0, 0]);
          return {
            id: r.recordid ?? String(Math.random()),
            id_falla: r.fields?.id_falla,
            nombre: r.fields?.nombre ?? "",
            seccion: r.fields?.seccion ?? "",
            artista: r.fields?.artista,
            fallera: r.fields?.fallera,
            presidente: r.fields?.presidente,
            lat: pt[0],
            lng: pt[1],
          };
        });
      setFallas(list.length > 0 ? list : FALLBACK_FALLAS);
    } catch {
      setFallas(FALLBACK_FALLAS);
      setError(
        i18n.language === "en"
          ? "Using cached data. Some locations may be approximate."
          : "Usando datos en caché. Algunas ubicaciones pueden ser aproximadas."
      );
    } finally {
      setLoading(false);
    }
  }, [i18n.language]);

  useEffect(() => {
    fetchFallas();
  }, [fetchFallas]);

  const sections = Array.from(
    new Set(fallas.map((f) => f.seccion).filter(Boolean))
  ).sort();

  const filterBySearch = useCallback(
    (f: FallaRecord) => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      const words = q.split(/\s+/).filter(Boolean);
      const searchable = [
        f.nombre,
        f.seccion,
        f.artista,
        f.fallera,
        f.presidente,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return words.every((word) => searchable.includes(word));
    },
    [searchQuery]
  );

  const filteredFallas = fallas
    .filter((f) => (sectionFilter === "all" || f.seccion === sectionFilter))
    .filter((f) => !soloDame || (f.id_falla != null && f.id_falla in DAME_FALLAS))
    .filter(filterBySearch);

  const handleCenter = () => {
    const fn = (window as any).__fallasCenterFn;
    if (typeof fn === "function") fn();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center justify-between gap-3 p-4 border-b bg-card">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl font-bold flex items-center gap-2 truncate">
              <Flame className="h-6 w-6 text-orange-500 flex-shrink-0" />
              {i18n.language === "en" ? "Fallas de Valencia" : "Fallas de València"}
            </h1>
            <p className="text-sm text-muted-foreground truncate">
              {i18n.language === "en"
                ? "Official monuments from Open Data"
                : "Monumentos oficiales - Open Data Ayuntamiento"}
            </p>
          </div>
        </div>
      </div>

      {/* Buscador y filtros */}
      <div className="p-4 pb-3 space-y-3 border-b bg-muted/30">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={i18n.language === "en" ? "Search falla, artist, fallera, section…" : "Buscar falla, artista, fallera, sección…"}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={sectionFilter} onValueChange={setSectionFilter}>
            <SelectTrigger className="w-[140px] sm:w-[160px] h-9">
              <SelectValue placeholder={i18n.language === "en" ? "Section" : "Sección"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {i18n.language === "en" ? "All sections" : "Todas las secciones"}
              </SelectItem>
              {sections.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
            <Button
              variant={soloDame ? "default" : "outline"}
              size="sm"
              onClick={() => setSoloDame((v) => !v)}
              className={`h-9 ${soloDame ? "bg-orange-500 hover:bg-orange-600" : ""}`}
            >
              <Filter className="h-4 w-4 mr-1" />
              {i18n.language === "en" ? "DAME only" : "Solo DAME"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleCenter} className="h-9">
            <MapPin className="h-4 w-4 mr-1" />
            {i18n.language === "en" ? "Center" : "Centrar"}
          </Button>
          <span className="text-sm text-muted-foreground whitespace-nowrap ml-auto">
            {filteredFallas.length} {i18n.language === "en" ? "fallas" : "fallas"}
          </span>
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-2 flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="flex-1 relative min-h-[400px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/30 z-10">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : null}
        <MapContainer
          center={VALENCIA_CENTER}
          zoom={13}
          className="w-full h-full min-h-[400px] z-0"
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController onCenter={() => {}} />
          {filteredFallas.map((f) => {
            const dameInfo = f.id_falla != null ? DAME_FALLAS[f.id_falla] : undefined;
            const isDame = !!dameInfo;
            const isSpecial = !isDame && (f.seccion === "Secció Especial" || f.seccion === "1A");
            const markerType = isDame ? "dame" : isSpecial ? "special" : "normal";
            return (
              <Marker
                key={f.id}
                position={[f.lat, f.lng]}
                icon={createFallaIcon(markerType)}
              >
                <Popup className="falla-map-popup">
                  <div className="falla-popup-card" style={{ background: "#fff", color: "#1e293b", padding: "16px", minWidth: "240px" }}>
                    {isDame && (
                      <div className="falla-popup-dame-badge" style={{ background: "linear-gradient(135deg,#ea580c,#c2410c)", color: "#fff", padding: "12px 44px 12px 16px", borderRadius: "16px 16px 0 0", margin: "-16px -16px 12px -16px" }}>
                        <strong style={{ display: "block" }}>{dameInfo.label}</strong>
                        <a href={dameInfo.link} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: 8, padding: "6px 12px", background: "rgba(255,255,255,0.3)", color: "#fff", borderRadius: 8, fontSize: 12, textDecoration: "none" }}>
                          {i18n.language === "en" ? "View event →" : "Ver evento →"}
                        </a>
                      </div>
                    )}
                    <div className="falla-popup-body" style={{ padding: "0 32px 0 0" }}>
                      <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 600 }}>{f.nombre}</h3>
                      {f.seccion && <p style={{ margin: "4px 0", fontSize: 13 }}><strong>{i18n.language === "en" ? "Section" : "Sección"}:</strong> {f.seccion}</p>}
                      {f.artista && <p style={{ margin: "4px 0", fontSize: 13 }}><strong>{i18n.language === "en" ? "Artist" : "Artista"}:</strong> {f.artista}</p>}
                      {f.fallera && <p style={{ margin: "4px 0", fontSize: 13 }}><strong>Fallera Major:</strong> {f.fallera}</p>}
                      {f.presidente && <p style={{ margin: "4px 0", fontSize: 13 }}><strong>{i18n.language === "en" ? "President" : "Presidente"}:</strong> {f.presidente}</p>}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
        <CentrarButton onClick={handleCenter} />
      </div>
    </div>
  );
};

export default Fallas;
