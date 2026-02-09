/**
 * Estructura del blog DAME.
 * Los posts pueden venir después de un CMS, API o estar aquí en estático.
 */

/** Información estructurada del evento/plan (fechas, lugar, precio) */
export type BlogPostEventInfo = {
  /** Fecha(s) del evento, ej. "22 de febrero de 2026" o "8-15 de febrero" */
  eventDate?: string;
  eventDate_en?: string;
  /** Lugar o ubicación */
  location?: string;
  location_en?: string;
  /** Precio o entrada, ej. "Gratis", "Desde 10,50 €" */
  price?: string;
  price_en?: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  title_en?: string;
  excerpt: string;
  excerpt_en?: string;
  content: string;
  content_en?: string;
  author?: string;
  publishedAt: string; // ISO date
  image?: string;
  tags?: string[];
  /** Enlace a la fuente del artículo */
  sourceUrl?: string;
  sourceLabel?: string;
  /** Datos del evento/plan para mostrar en listado y detalle */
  event?: BlogPostEventInfo;
};

/** Listado de posts. Por ahora estático; en el futuro se obtendrán del backend. */
export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "crida-fallas-2026-valencia",
    title: "La Crida 2026: el pistoletazo de salida de las Fallas en Valencia",
    title_en: "La Crida 2026: the official start of Fallas in Valencia",
    excerpt: "El último domingo de febrero las Fallas arrancan con la Crida desde las Torres de Serranos: macrodespertá, mascletá y el discurso de las falleras.",
    excerpt_en: "On the last Sunday of February, Fallas kick off with La Crida from the Serranos Towers: macrodespertá, mascletá and the falleras' speech.",
    publishedAt: "2026-01-28T10:00:00.000Z",
    author: "DAME",
    tags: ["fallas", "valencia", "febrero", "eventos"],
    content: `Las Fallas de 2026 tienen su pistoletazo de salida oficial el último domingo de febrero con la Crida. Es el momento en que las falleras mayores suben a las Torres de Serranos y dan el discurso que inaugura la fiesta.

Durante todo el día la ciudad se llena de ambiente: macrodespertá por la mañana, mascletá y, tras el acto en Serranos, un espectáculo de fuegos artificiales que marca el comienzo de unas semanas inigualables en Valencia.

Si estás en Valencia ese fin de semana, no te pierdas la Crida: es emoción pura y el mejor preludio a la semana fallera.`,
    image: "https://offloadmedia.feverup.com/valenciasecreta.com/wp-content/uploads/2024/02/19101554/crida-fallas-2024-1024x683.jpg",
    sourceUrl: "https://valenciasecreta.com/programa-oficial-fallas/",
    sourceLabel: "Valencia Secreta — Programa oficial Fallas 2026",
    event: {
      eventDate: "22 de febrero de 2026",
      eventDate_en: "22 February 2026",
      location: "Torres de Serranos, Valencia",
      location_en: "Serranos Towers, Valencia",
      price: "Gratis",
      price_en: "Free",
    },
    content_en: `Fallas 2026 officially begin on the last Sunday of February with La Crida. The senior falleras climb the Serranos Towers and deliver the speech that opens the festival.

Throughout the day the city is buzzing: a macro wake-up in the morning, mascletà, and after the ceremony at Serranos, a firework display that marks the start of an unforgettable few weeks in Valencia.

If you're in Valencia that weekend, don't miss La Crida: it's pure emotion and the best prelude to Fallas week.`,
  },
  {
    slug: "titanic-experiencia-inmersiva-valencia",
    title: "La leyenda del Titanic: experiencia inmersiva en Valencia",
    title_en: "The legend of the Titanic: immersive experience in Valencia",
    excerpt: "Bombas Gens acoge desde el 27 de febrero una experiencia inmersiva sobre el Titanic con realidad virtual, testimonios y objetos de época.",
    excerpt_en: "From 27 February, Bombas Gens hosts an immersive Titanic experience with virtual reality, testimonies and period objects.",
    publishedAt: "2026-01-27T10:00:00.000Z",
    author: "DAME",
    tags: ["cultura", "valencia", "experiencia", "bombas-gens"],
    content: `Valencia recibe el 27 de febrero de 2026 una de las experiencias inmersivas más celebradas de los últimos años: La leyenda del Titanic. Después de triunfar en Madrid y Londres, llega a Bombas Gens Centre d'Arts Digitals.

La muestra combina testimonios de pasajeros, objetos de la época, piezas relacionadas con la célebre película y tecnología actual: realidad virtual y aumentada, metaverso y una película inmersiva para sentirte como un pasajero más del RMS Titanic.

Entradas desde 10,50 €. La exposición permanece hasta el 13 de abril. Ideal para planear una tarde de cultura y experiencia en la ciudad.`,
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1024&q=80",
    sourceUrl: "https://valenciasecreta.com/entradas-la-leyenda-del-titanic-exposicion-inmersiva-bombas-gens/",
    sourceLabel: "Valencia Secreta — La leyenda del Titanic en Bombas Gens",
    event: {
      eventDate: "27 feb – 13 abr 2026",
      eventDate_en: "27 Feb – 13 Apr 2026",
      location: "Bombas Gens Centre d'Arts Digitals",
      location_en: "Bombas Gens Centre d'Arts Digitals",
      price: "Desde 10,50 €",
      price_en: "From €10.50",
    },
    content_en: `On 27 February 2026 Valencia hosts one of the most acclaimed immersive experiences of recent years: The Legend of the Titanic. After success in Madrid and London, it arrives at Bombas Gens Centre d'Arts Digitals.

The exhibition combines passenger testimonies, period objects, items linked to the famous film and current technology: virtual and augmented reality, metaverse and an immersive film so you feel like another passenger on the RMS Titanic.

Tickets from €10.50. The exhibition runs until 13 April. Ideal for planning an afternoon of culture and experience in the city.`,
  },
  {
    slug: "candlelight-conciertos-febrero-valencia",
    title: "Candlelight en febrero: conciertos a la luz de las velas en Valencia",
    title_en: "Candlelight in February: candlelit concerts in Valencia",
    excerpt: "Candlelight programa en febrero tributos a ABBA, Bridgerton, Vivaldi, Hans Zimmer y The Beatles en el Ateneo Mercantil, más un especial San Valentín.",
    excerpt_en: "In February Candlelight offers tributes to ABBA, Bridgerton, Vivaldi, Hans Zimmer and The Beatles at Ateneo Mercantil, plus a Valentine's special.",
    publishedAt: "2026-01-25T10:00:00.000Z",
    author: "DAME",
    tags: ["conciertos", "música", "febrero", "valencia", "candlelight"],
    content: `Los conciertos Candlelight se han convertido en un clásico para vivir la música en un entorno único. Durante todo febrero de 2026 el Ateneo Mercantil de Valencia acoge varias citas: tributos a ABBA, a la banda sonora de Los Bridgerton, a Las cuatro estaciones de Vivaldi, a Hans Zimmer y a The Beatles, además de un concierto especial por San Valentín.

Entradas desde 17 €. Si buscas un plan diferente en pareja o con amigos —música, velas y buena acústica—, Candlelight en Valencia es una muy buena opción para febrero.`,
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1024&q=80",
    sourceUrl: "https://valenciasecreta.com/candlelight-valencia/",
    sourceLabel: "Valencia Secreta — Candlelight Valencia",
    event: {
      eventDate: "Febrero 2026",
      eventDate_en: "February 2026",
      location: "Ateneo Mercantil, Valencia",
      location_en: "Ateneo Mercantil, Valencia",
      price: "Desde 17 €",
      price_en: "From €17",
    },
    content_en: `Candlelight concerts have become a classic way to experience music in a unique setting. Throughout February 2026 Valencia's Ateneo Mercantil hosts several dates: tributes to ABBA, the Bridgerton soundtrack, Vivaldi's Four Seasons, Hans Zimmer and The Beatles, plus a special Valentine's concert.

Tickets from €17. If you're looking for something different to do as a couple or with friends —music, candles and great acoustics— Candlelight in Valencia is a great February option.`,
  },
  {
    slug: "exposicion-ninot-fallas-2026",
    title: "Exposición del Ninot 2026 en la Ciutat de les Arts i les Ciències",
    title_en: "The Ninot Exhibition 2026 at the City of Arts and Sciences",
    excerpt: "Desde el 7 de febrero el Museo de las Ciencias acoge la exposición del Ninot, una de las citas más visitadas del preludio fallero. Entrada 4 €.",
    excerpt_en: "From 7 February the Science Museum hosts the Ninot exhibition, one of the most visited events in the run-up to Fallas. Admission €4.",
    publishedAt: "2026-01-24T10:00:00.000Z",
    author: "DAME",
    tags: ["fallas", "ninot", "exposicion", "ciudad-artes-ciencias"],
    content: `Cada año la Ciutat de les Arts i les Ciències se suma al ambiente fallero con la Exposición del Ninot. En 2026 abre el sábado 7 de febrero en el Museo de las Ciencias y permanece hasta el 15 de marzo.

Es una de las exposiciones más visitadas de Valencia: puedes ver los ninots que optan a ser indultados (el que recibe más votos se salva de la cremà). Entrada 4 €. Un plan perfecto para acercarse a las Fallas con calma y en familia o con amigos.`,
    image: "https://offloadmedia.feverup.com/valenciasecreta.com/wp-content/uploads/2023/02/13123509/fallas-valencia-2023-ofrenda.jpg",
    sourceUrl: "https://valenciasecreta.com/programa-oficial-fallas/",
    sourceLabel: "Valencia Secreta — Programa oficial Fallas (Exposición del Ninot)",
    event: {
      eventDate: "7 feb – 15 mar 2026",
      eventDate_en: "7 Feb – 15 Mar 2026",
      location: "Museo de las Ciencias, Ciutat de les Arts i les Ciències",
      location_en: "Science Museum, City of Arts and Sciences",
      price: "4 €",
      price_en: "€4",
    },
    content_en: `Every year the City of Arts and Sciences joins the Fallas spirit with the Ninot Exhibition. In 2026 it opens on Saturday 7 February at the Science Museum and runs until 15 March.

It's one of Valencia's most visited exhibitions: you can see the ninots in the running to be pardoned (the one that gets the most votes is saved from the cremà). Admission €4. A perfect plan to get into the Fallas mood at your own pace, with family or friends.`,
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getPostsSortedByDate(): BlogPost[] {
  return [...BLOG_POSTS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}
