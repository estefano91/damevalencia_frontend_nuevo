export type NetStatus = "available" | "pending" | "full";
export const VALENCIA_VOLLEY_TOTAL_NETS = 6;
export const VALENCIA_VOLLEY_DAILY_FEE_EUR = 20;
export const VALENCIA_VOLLEY_DEPOSIT_REQUIRED = true;
export const VALENCIA_VOLLEY_DEPOSIT_EUR = 50;
export const VALENCIA_VOLLEY_PICKUP_RETURN_ADDRESS =
  "Asociación DAME, Valencia";
export const VALENCIA_VOLLEY_SHEET_CSV_URL =
  import.meta.env.VITE_VALENCIA_VOLLEY_SHEET_CSV_URL ||
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRefTHDc_tm9IXAyCsLQupXpaZSIk1BlfJ-kfH1_sp-IL8uFm5YtNvh3HfrszviWydtx30qxhU38JmJ/pub?gid=0&single=true&output=csv";

export interface ValenciaVolleySlot {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  location: string;
  netName: string;
  status: NetStatus;
  assignedPerson: string;
  contactLabel: string;
  contactUrl: string; // WhatsApp / Telegram / Instagram DM link
  totalSpots: number;
  openSpots: number;
  priceEur: number; // Mantener por compatibilidad, pero el MVP muestra fee diario fijo.
  stripePaymentUrl: string;
  notes?: string;
}

type CsvRow = Record<string, string>;

const toStatus = (value: string): NetStatus => {
  const normalized = value.trim().toLowerCase();
  if (normalized === "available" || normalized === "disponible") return "available";
  if (normalized === "pending" || normalized === "pendiente") return "pending";
  return "full";
};

const parseCsvLine = (line: string): string[] => {
  const out: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      out.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  out.push(current.trim());
  return out.map((v) => v.replace(/^"(.*)"$/, "$1").trim());
};

const parseCsv = (csv: string): CsvRow[] => {
  const lines = csv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row: CsvRow = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = values[idx] ?? "";
    });
    return row;
  });
};

const toNumber = (raw: string, fallback: number): number => {
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
};

/**
 * Lee slots desde Google Sheets en CSV público.
 * Encabezados esperados (snake_case):
 * id,date,start_time,end_time,location,net_name,status,assigned_person,contact_label,contact_url,total_spots,open_spots,price_eur,stripe_payment_url,notes
 * También acepta "note" (singular) por compatibilidad de hoja.
 */
export async function fetchValenciaVolleySlotsFromSheet(
  csvUrl: string
): Promise<ValenciaVolleySlot[]> {
  if (!csvUrl.trim()) return [];
  const res = await fetch(csvUrl, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Could not load sheet CSV (${res.status})`);
  }
  const text = await res.text();
  const rows = parseCsv(text);
  return rows
    .map((row, index) => {
      const date = row.date?.trim();
      const startTime = row.start_time?.trim();
      const endTime = row.end_time?.trim();
      const netName = row.net_name?.trim();
      if (!date || !startTime || !endTime || !netName) return null;
      const slot: ValenciaVolleySlot = {
        id: row.id?.trim() || `sheet-slot-${index + 1}`,
        date,
        startTime,
        endTime,
        location: row.location?.trim() || "Asociación DAME, Valencia",
        netName,
        status: toStatus(row.status || "available"),
        assignedPerson: row.assigned_person?.trim() || "-",
        contactLabel: row.contact_label?.trim() || "Contacto",
        contactUrl: row.contact_url?.trim() || "#",
        totalSpots: toNumber(row.total_spots, 12),
        openSpots: toNumber(row.open_spots, 0),
        priceEur: toNumber(row.price_eur, VALENCIA_VOLLEY_DAILY_FEE_EUR),
        stripePaymentUrl: row.stripe_payment_url?.trim() || "",
        notes: row.notes?.trim() || row.note?.trim() || undefined,
      };
      return slot;
    })
    .filter((slot): slot is ValenciaVolleySlot => slot !== null);
}

/**
 * Fuente de verdad del MVP sin backend.
 * - Edita aquí disponibilidad, persona asignada y links Stripe.
 * - Cada slot puede apuntar a un Payment Link distinto.
 * - Inventario total de redes: VALENCIA_VOLLEY_TOTAL_NETS.
 */
export const VALENCIA_VOLLEY_SLOTS: ValenciaVolleySlot[] = [
  {
    id: "vv-2026-05-01-net-1-0900",
    date: "2026-05-01",
    startTime: "09:00",
    endTime: "21:00",
    location: "Asociación DAME, Valencia",
    netName: "Net 1",
    status: "pending",
    assignedPerson: "Edit",
    contactLabel: "WhatsApp Edit",
    contactUrl: "https://wa.me/34",
    totalSpots: 1,
    openSpots: 0,
    priceEur: 20,
    stripePaymentUrl: "",
    notes: "Reservada (pendiente de confirmación).",
  },
  {
    id: "vv-2026-05-01-net-2-0900",
    date: "2026-05-01",
    startTime: "09:00",
    endTime: "21:00",
    location: "Asociación DAME, Valencia",
    netName: "Net 2",
    status: "available",
    assignedPerson: "-",
    contactLabel: "Contacto DAME",
    contactUrl: "https://wa.me/34644070282",
    totalSpots: 1,
    openSpots: 1,
    priceEur: 20,
    stripePaymentUrl: "",
  },
  {
    id: "vv-2026-05-01-net-3-0900",
    date: "2026-05-01",
    startTime: "09:00",
    endTime: "21:00",
    location: "Asociación DAME, Valencia",
    netName: "Net 3",
    status: "available",
    assignedPerson: "-",
    contactLabel: "Contacto DAME",
    contactUrl: "https://wa.me/34644070282",
    totalSpots: 1,
    openSpots: 1,
    priceEur: 20,
    stripePaymentUrl: "",
  },
  {
    id: "vv-2026-05-01-net-4-0900",
    date: "2026-05-01",
    startTime: "09:00",
    endTime: "21:00",
    location: "Asociación DAME, Valencia",
    netName: "Net 4",
    status: "available",
    assignedPerson: "-",
    contactLabel: "Contacto DAME",
    contactUrl: "https://wa.me/34644070282",
    totalSpots: 1,
    openSpots: 1,
    priceEur: 20,
    stripePaymentUrl: "",
  },
  {
    id: "vv-2026-05-01-net-5-0900",
    date: "2026-05-01",
    startTime: "09:00",
    endTime: "21:00",
    location: "Asociación DAME, Valencia",
    netName: "Net 5",
    status: "available",
    assignedPerson: "-",
    contactLabel: "Contacto DAME",
    contactUrl: "https://wa.me/34644070282",
    totalSpots: 1,
    openSpots: 1,
    priceEur: 20,
    stripePaymentUrl: "",
  },
  {
    id: "vv-2026-05-01-net-6-0900",
    date: "2026-05-01",
    startTime: "09:00",
    endTime: "21:00",
    location: "Asociación DAME, Valencia",
    netName: "Net 6",
    status: "available",
    assignedPerson: "-",
    contactLabel: "Contacto DAME",
    contactUrl: "https://wa.me/34644070282",
    totalSpots: 1,
    openSpots: 1,
    priceEur: 20,
    stripePaymentUrl: "",
  },
  {
    id: "vv-2026-04-26-net-a-1900",
    date: "2026-04-26",
    startTime: "19:00",
    endTime: "20:30",
    location: "Cauce del Turia - Tramo V",
    netName: "Net A",
    status: "available",
    assignedPerson: "Ana",
    contactLabel: "WhatsApp Ana",
    contactUrl: "https://wa.me/34600000001",
    totalSpots: 12,
    openSpots: 5,
    priceEur: 4.5,
    stripePaymentUrl: "https://buy.stripe.com/test_1234567890",
    notes: "Nivel mixto, bring your own ball if possible.",
  },
  {
    id: "vv-2026-04-26-net-b-1900",
    date: "2026-04-26",
    startTime: "19:00",
    endTime: "20:30",
    location: "Cauce del Turia - Tramo V",
    netName: "Net B",
    status: "pending",
    assignedPerson: "Luis",
    contactLabel: "WhatsApp Luis",
    contactUrl: "https://wa.me/34600000002",
    totalSpots: 12,
    openSpots: 2,
    priceEur: 4.5,
    stripePaymentUrl: "https://buy.stripe.com/test_1234567890",
    notes: "Pendiente de confirmar 2 pagos.",
  },
  {
    id: "vv-2026-04-27-net-a-2030",
    date: "2026-04-27",
    startTime: "20:30",
    endTime: "22:00",
    location: "Playa de la Malvarrosa",
    netName: "Net A",
    status: "full",
    assignedPerson: "Marta",
    contactLabel: "WhatsApp Marta",
    contactUrl: "https://wa.me/34600000003",
    totalSpots: 10,
    openSpots: 0,
    priceEur: 5,
    stripePaymentUrl: "https://buy.stripe.com/test_1234567890",
    notes: "Completo. Puedes contactar por si se libera plaza.",
  },
  {
    id: "vv-2026-04-28-net-c-1900",
    date: "2026-04-28",
    startTime: "19:00",
    endTime: "20:30",
    location: "Cauce del Turia - Tramo IV",
    netName: "Net C",
    status: "available",
    assignedPerson: "Carlos",
    contactLabel: "Telegram Carlos",
    contactUrl: "https://t.me/valenciavolley_carlos",
    totalSpots: 12,
    openSpots: 8,
    priceEur: 4,
    stripePaymentUrl: "https://buy.stripe.com/test_1234567890",
  },
];
