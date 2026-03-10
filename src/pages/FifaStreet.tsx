import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Trophy,
  Target,
  Zap,
  Image as ImageIcon,
  MessageCircle,
  ChevronRight,
  Award,
  TrendingUp,
  Euro,
  ExternalLink,
  FileText,
  Banknote,
} from 'lucide-react';

// Mock data – sustituir por API cuando exista
const NEXT_MATCHDAY = {
  dateFrom: '13 abril',
  dateTo: '30 abril',
  days: 'Lunes y Jueves',
  venue: 'Polideportivo Betero',
  address: 'Valencia',
  mapUrl: 'https://www.google.com/maps/search/Polideportivo+Betero+Valencia',
  format: '5v5 · Arranque 2v2',
  prize: 150,
  prizePayment: 'Transferencia o Bizum al capitán del equipo ganador.',
  prizeWhen: 'En un plazo máximo de 7 días naturales tras la jornada final (30 abril).',
  prizePaymentEn: 'By bank transfer or Bizum to the winning team captain.',
  prizeWhenEn: 'Within 7 calendar days after the final matchday (30 April).',
  spotsLeft: 4,
  totalSpots: 16,
};

const STANDINGS = [
  { position: 1, name: 'Crew Norte', points: 28, played: 10, goalsFor: 42, goalsAgainst: 18, form: 'WWWWW' },
  { position: 2, name: 'Street Ruzafa', points: 25, played: 10, goalsFor: 38, goalsAgainst: 22, form: 'WWWLW' },
  { position: 3, name: 'Benimaclet FC', points: 22, played: 10, goalsFor: 35, goalsAgainst: 25, form: 'WLWWW' },
  { position: 4, name: 'El Carmen Ballers', points: 19, played: 10, goalsFor: 30, goalsAgainst: 28, form: 'LWWWL' },
  { position: 5, name: 'Paterna Street', points: 15, played: 10, goalsFor: 26, goalsAgainst: 32, form: 'WLLWW' },
];

const TOP_SCORERS = [
  { rank: 1, name: 'Dani M.', team: 'Crew Norte', goals: 14 },
  { rank: 2, name: 'Marcos T.', team: 'Street Ruzafa', goals: 12 },
  { rank: 3, name: 'Pablo G.', team: 'Benimaclet FC', goals: 11 },
];

const TOP_ASSISTS = [
  { rank: 1, name: 'Jorge L.', team: 'Crew Norte', assists: 9 },
  { rank: 2, name: 'Adrián S.', team: 'Street Ruzafa', assists: 8 },
  { rank: 3, name: 'Raúl V.', team: 'Benimaclet FC', assists: 7 },
];

const CALENDAR_UPCOMING = [
  { jornada: 1, date: 'Lun 13 Abr', venue: 'Polideportivo Betero' },
  { jornada: 2, date: 'Jue 16 Abr', venue: 'Polideportivo Betero' },
  { jornada: 3, date: 'Lun 20 Abr', venue: 'Polideportivo Betero' },
  { jornada: 4, date: 'Jue 23 Abr', venue: 'Polideportivo Betero' },
  { jornada: 5, date: 'Lun 27 Abr', venue: 'Polideportivo Betero' },
  { jornada: 6, date: 'Jue 30 Abr', venue: 'Polideportivo Betero' },
];

const CALENDAR_PAST = [
  { jornada: 10, date: 'Sáb 8 Mar', result: 'Crew Norte 5-2 El Carmen' },
  { jornada: 9, date: 'Sáb 1 Mar', result: 'Street Ruzafa 4-3 Benimaclet' },
];

const WHATSAPP_SIGNUP = 'https://wa.me/34600000000?text=Hola%2C%20quiero%20apuntarme%20a%20la%20próxima%20jornada%20FIFA%20Street%20League%20VLC';

const RULES_ES = [
  { title: 'Formato', text: '5 contra 5. Cada partido empieza con 2v2 en pista; el resto de jugadores entran según dinámica del partido.' },
  { title: 'Duración', text: '2 partes de 10 minutos a reloj corrido (o según organización el día de la jornada).' },
  { title: 'Tarjeta azul', text: 'Expulsión temporal de 2 minutos. El equipo juega con un jugador menos hasta que pase el tiempo. Reincorporación en el centro del campo.' },
  { title: 'Tarjeta amarilla', text: 'Amonestación. Dos amarillas en el mismo partido = expulsión (tarjeta roja).' },
  { title: 'Tarjeta roja', text: 'Expulsión definitiva del partido. El equipo termina con un jugador menos.' },
  { title: 'Fuera de juego', text: 'No hay fuera de juego.' },
  { title: 'Saques y corners', text: 'Saques de banda con las manos. Los corners se sacan con el pie desde la esquina.' },
  { title: 'Portería y área', text: 'El portero puede usar las manos solo dentro del área. Salida con los pies o con la mano (medio campo según organización).' },
  { title: 'Conducta y fair play', text: 'Respeto al rival, al árbitro y al público. Actitudes antideportivas pueden suponer amonestación, expulsión o baja de la liga.' },
];

const RULES_EN = [
  { title: 'Format', text: '5 vs 5. Each match starts 2v2 on the court; remaining players join as the game goes on.' },
  { title: 'Duration', text: '2 halves of 10 minutes running clock (or as set by the organisers on the day).' },
  { title: 'Blue card', text: 'Temporary sending-off for 2 minutes. The team plays with one player less until the time is up. Player returns from the centre.' },
  { title: 'Yellow card', text: 'Caution. Two yellows in the same match = sending-off (red card).' },
  { title: 'Red card', text: 'Sending-off for the rest of the match. The team finishes with one player less.' },
  { title: 'Offside', text: 'There is no offside.' },
  { title: 'Throw-ins and corners', text: 'Throw-ins with the hands. Corners taken with the foot from the corner.' },
  { title: 'Goal and area', text: 'The keeper may use hands only inside the area. Restart with feet or hand (halfway line as per organisers).' },
  { title: 'Conduct and fair play', text: 'Respect opponents, referees and spectators. Unsporting behaviour may lead to caution, sending-off or removal from the league.' },
];

const FifaStreet = () => {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const [galleryTab, setGalleryTab] = useState<'photos' | 'videos'>('photos');
  const rules = isEn ? RULES_EN : RULES_ES;

  const formBadge = (form: string) => {
    return form.split('').map((r, i) => (
      <span
        key={i}
        className={`inline-block w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center ${
          r === 'W' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
        }`}
      >
        {r}
      </span>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Portada FIFA Street League */}
      <section className="relative w-full overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900">
        <img
          src="/hf_20260310_121752_2a7af091-dd3b-439c-9bea-e79aadb8f0c8.jpeg"
          alt="FIFA Street League - Fútbol calle Valencia"
          className="w-full h-auto max-h-[70vh] object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-4 left-0 right-0 px-4 text-center pointer-events-none">
          <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
            {isEn ? 'Street football · Valencia' : 'Fútbol calle · Valencia'}
          </Badge>
        </div>
      </section>

      {/* Próxima jornada destacada */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 text-white px-4 py-6 sm:py-8">
        <div className="relative max-w-4xl mx-auto">
          <Card className="text-left bg-white/15 backdrop-blur border-0 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {isEn ? 'Next matchday' : 'Próxima jornada'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-white/95">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-emerald-200" />
                  {NEXT_MATCHDAY.dateFrom} – {NEXT_MATCHDAY.dateTo}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-emerald-200" />
                  {NEXT_MATCHDAY.days}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-emerald-200 shrink-0" />
                <a
                  href={NEXT_MATCHDAY.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/95 hover:text-white underline underline-offset-2 inline-flex items-center gap-1"
                >
                  {NEXT_MATCHDAY.venue}, {NEXT_MATCHDAY.address}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
              {NEXT_MATCHDAY.prize != null && (
                <div className="space-y-1">
                  <p className="text-sm text-white/95 flex items-center gap-1.5">
                    <Euro className="h-4 w-4 text-amber-300" />
                    <span className="font-semibold">{NEXT_MATCHDAY.prize}€</span>
                    {isEn ? ' prize' : ' de premio'}
                  </p>
                  <p className="text-xs text-emerald-100 flex items-start gap-1.5">
                    <Banknote className="h-3.5 w-3.5 text-amber-300 shrink-0 mt-0.5" />
                    <span>
                      {isEn ? NEXT_MATCHDAY.prizePaymentEn : NEXT_MATCHDAY.prizePayment}
                      {' · '}
                      {isEn ? NEXT_MATCHDAY.prizeWhenEn : NEXT_MATCHDAY.prizeWhen}
                    </span>
                  </p>
                </div>
              )}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="bg-white/20 text-white border-0">
                    {NEXT_MATCHDAY.format}
                  </Badge>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
                        <FileText className="mr-1.5 h-4 w-4" />
                        {isEn ? 'Rules' : 'Reglas'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          {isEn ? 'League rules' : 'Reglas de la liga'}
                        </DialogTitle>
                      </DialogHeader>
                      <ul className="space-y-4 mt-4">
                        {rules.map((r, i) => (
                          <li key={i} className="border-b border-muted pb-4 last:border-0 last:pb-0">
                            <p className="font-semibold text-foreground">{r.title}</p>
                            <p className="text-sm text-muted-foreground mt-1">{r.text}</p>
                          </li>
                        ))}
                      </ul>
                    </DialogContent>
                  </Dialog>
                  <span className="text-sm text-emerald-100">
                    {NEXT_MATCHDAY.spotsLeft} {isEn ? 'spots left' : 'plazas libres'} / {NEXT_MATCHDAY.totalSpots}
                  </span>
                </div>
                <Button
                  size="lg"
                  className="bg-white text-emerald-700 hover:bg-emerald-50 font-bold shadow-lg"
                  asChild
                >
                  <a href={WHATSAPP_SIGNUP} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    {isEn ? 'Sign up' : 'Apuntarse'}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-8">
        {/* Clasificación */}
        <section>
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-amber-500" />
            {isEn ? 'Standings' : 'Clasificación'}
          </h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-semibold w-8">#</th>
                      <th className="text-left p-3 font-semibold">{isEn ? 'Team' : 'Equipo'}</th>
                      <th className="text-right p-3 font-semibold w-12">Pts</th>
                      <th className="text-right p-3 font-semibold w-12">GF</th>
                      <th className="text-right p-3 font-semibold w-12">GA</th>
                      <th className="text-center p-3 font-semibold w-24">{isEn ? 'Form' : 'Racha'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {STANDINGS.map((row) => (
                      <tr key={row.position} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-3 font-bold">{row.position}</td>
                        <td className="p-3">{row.name}</td>
                        <td className="p-3 text-right font-semibold">{row.points}</td>
                        <td className="p-3 text-right">{row.goalsFor}</td>
                        <td className="p-3 text-right">{row.goalsAgainst}</td>
                        <td className="p-3 flex justify-center gap-0.5">{formBadge(row.form)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Estadísticas individuales */}
        <section>
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <Award className="h-5 w-5 text-emerald-600" />
            {isEn ? 'Individual stats' : 'Estadísticas individuales'}
          </h2>
          <Tabs defaultValue="scorers" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="scorers" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                {isEn ? 'Top scorers' : 'Goleadores'}
              </TabsTrigger>
              <TabsTrigger value="assists" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                {isEn ? 'Assists' : 'Asistentes'}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="scorers" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  <ul className="divide-y">
                    {TOP_SCORERS.map((p) => (
                      <li key={p.rank} className="flex items-center justify-between p-4 hover:bg-muted/30">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 font-bold text-sm">
                            {p.rank}
                          </span>
                          <div>
                            <p className="font-semibold">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.team}</p>
                          </div>
                        </div>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{p.goals} goles</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="assists" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  <ul className="divide-y">
                    {TOP_ASSISTS.map((p) => (
                      <li key={p.rank} className="flex items-center justify-between p-4 hover:bg-muted/30">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 font-bold text-sm">
                            {p.rank}
                          </span>
                          <div>
                            <p className="font-semibold">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.team}</p>
                          </div>
                        </div>
                        <span className="font-bold text-blue-600 dark:text-blue-400">{p.assists} asistencias</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* Calendario */}
        <section>
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            {isEn ? 'Calendar' : 'Calendario'}
          </h2>
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upcoming">{isEn ? 'Upcoming' : 'Próximas'}</TabsTrigger>
              <TabsTrigger value="past">{isEn ? 'Past results' : 'Resultados'}</TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  <ul className="divide-y">
                    {CALENDAR_UPCOMING.map((j) => (
                      <li key={j.jornada} className="flex items-center justify-between p-4 hover:bg-muted/30">
                        <div>
                          <p className="font-semibold">Jornada {j.jornada}</p>
                          <p className="text-sm text-muted-foreground">{j.date} · {j.venue}</p>
                        </div>
                        <Button size="sm" asChild>
                          <a href={WHATSAPP_SIGNUP} target="_blank" rel="noopener noreferrer">
                            {isEn ? 'Sign up' : 'Apuntarse'}
                          </a>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="past" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  <ul className="divide-y">
                    {CALENDAR_PAST.map((j) => (
                      <li key={j.jornada} className="flex items-center justify-between p-4">
                        <div>
                          <p className="font-semibold">Jornada {j.jornada}</p>
                          <p className="text-sm text-muted-foreground">{j.date}</p>
                        </div>
                        <span className="text-sm font-medium">{j.result}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* Galería */}
        <section>
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <ImageIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            {isEn ? 'Gallery' : 'Galería'}
          </h2>
          <Card>
            <CardContent className="p-4">
              <Tabs value={galleryTab} onValueChange={(v) => setGalleryTab(v as 'photos' | 'videos')}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="photos">{isEn ? 'Photos' : 'Fotos'}</TabsTrigger>
                  <TabsTrigger value="videos">{isEn ? 'Videos' : 'Vídeos'}</TabsTrigger>
                </TabsList>
                <TabsContent value="photos" className="mt-0">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-lg bg-muted flex items-center justify-center text-muted-foreground"
                      >
                        <ImageIcon className="h-10 w-10" />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    {isEn ? 'Best plays and celebrations — more soon.' : 'Mejores jugadas y celebraciones — más pronto.'}
                  </p>
                </TabsContent>
                <TabsContent value="videos" className="mt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="aspect-video rounded-lg bg-muted flex items-center justify-center text-muted-foreground"
                      >
                        <span className="text-sm">Vídeo {i}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    {isEn ? 'Short clips from the league.' : 'Vídeos cortos de la liga.'}
                  </p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </section>

        {/* CTA final */}
        <section className="pb-8">
          <Card className="bg-gradient-to-br from-emerald-600 to-green-700 border-0 text-white overflow-hidden">
            <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-white/20">
                  <Users className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    {isEn ? 'Ready to play?' : '¿Listo para jugar?'}
                  </h3>
                  <p className="text-emerald-100 text-sm mt-1">
                    {isEn ? 'Sign up in under a minute via WhatsApp.' : 'Apúntate en menos de 1 minuto por WhatsApp.'}
                  </p>
                </div>
              </div>
              <Button
                size="lg"
                className="bg-white text-emerald-700 hover:bg-emerald-50 font-bold shrink-0"
                asChild
              >
                <a href={WHATSAPP_SIGNUP} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  {isEn ? 'Sign up' : 'Apuntarse'}
                  <TrendingUp className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default FifaStreet;
