import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Home, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CommunityLinks = () => {
  const navigate = useNavigate();
  const whatsappGroups = [
    { name: "Comunidad Salsa", icon: "💃", url: "https://chat.whatsapp.com/JhtzEylNaAT1EnHQmNi3Dc" },
    { name: "Comunidad Bachata", icon: "🕺", url: "https://chat.whatsapp.com/GSfzCHspYY1LJxmbozWc1m" },
    { name: "Actividades Zen", icon: "🧘", url: "https://chat.whatsapp.com/CFgD6wStj2q7PJjiY633qY" },
    { name: "Comunidad Fútbol", icon: "⚽", url: "https://chat.whatsapp.com/GLTEVz2YjVTAq7F6JgXPeO" },
    { name: "Búsqueda de Empleo DAME", icon: "💼", url: "https://chat.whatsapp.com/KfjUGTqVbel38etVlAQ9nu" },
    { name: "Vivienda DAME", icon: "🏠", url: "https://chat.whatsapp.com/KrX2FJBXF336sy2ZlyHYh0" },
    { name: "Música (Jam Sessions)", icon: "🎵", url: "https://chat.whatsapp.com/HYnZYcXgAti3XrBRPtqyWv" },
  ];

  const instagramPages = [
    { name: "Salsa", icon: "💃", url: "https://instagram.com/damecasino.valencia" },
    { name: "Bachata", icon: "🕺", url: "https://instagram.com/damebachata.valencia" },
    { name: "Volley Valencia", icon: "🏐", url: "https://instagram.com/valenciavolley" },
    { name: "Zen", icon: "🧘", url: "https://instagram.com/valenciazen.official" },
    { name: "Sports", icon: "⚽", url: "https://instagram.com/damefit.valencia" },
    { name: "Música (Jam Sessions)", icon: "🎵", url: "https://instagram.com/damemusica.valencia" },
    { name: "Apoyo Social e Integración Comunitaria", icon: "🤝", url: "https://instagram.com/dame.vlc" },
  ];

  const playlists = [
    { name: "Playlist Bachata", icon: "🎵", url: "https://open.spotify.com/playlist/3WSWPJ8h8IfFSFplRMIVOF", available: true },
    { name: "Playlist Salsa", icon: "🎶", url: null, available: false },
  ];

  const moreLinks = [
    { name: "Canal Telegram DAME", icon: "📱", description: "Recibe actualizaciones y noticias en tiempo real", url: "https://t.me/damevalencia" },
  ];

  const LinkCard = ({ name, icon, url, description, available = true }: { name: string; icon: string; url: string | null; description?: string; available?: boolean }) => {
    const content = (
      <div className="flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer group hover:shadow-lg hover:scale-105">
        <div className="flex items-center gap-3 flex-1">
          <div className="text-2xl flex-shrink-0">{icon}</div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{name}</h3>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            {!available && <span className="text-xs text-orange-600 font-medium">Próximamente</span>}
          </div>
        </div>
        <div className="text-2xl text-purple-600 group-hover:translate-x-1 transition-transform">
          {available ? "→" : "🔒"}
        </div>
      </div>
    );

    if (available && url) {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block">
          {content}
        </a>
      );
    }

    return <div className="opacity-60">{content}</div>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
      <div className="container mx-auto px-4 py-8">
        {/* Botón volver al inicio */}
        <div className="mb-6">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 dame-text-gradient">
            Comunidad DAME Valencia
          </h1>
          <p className="text-xl text-muted-foreground">
            Conecta con nuestras comunidades especializadas
          </p>
        </div>

        {/* Grupos de WhatsApp */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Grupos de WhatsApp</CardTitle>
            <p className="text-muted-foreground">
              Únete a nuestros grupos comunitarios y conecta con personas que comparten tus intereses.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {whatsappGroups.map((group, idx) => (
                <LinkCard key={idx} name={group.name} icon={group.icon} url={group.url} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Páginas de Instagram */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Páginas de Instagram</CardTitle>
            <p className="text-muted-foreground">
              Síguenos en Instagram y mantente al día con nuestras comunidades especializadas.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {instagramPages.map((page, idx) => (
                <LinkCard key={idx} name={page.name} icon={page.icon} url={page.url} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Playlists */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Nuestras Playlists</CardTitle>
            <p className="text-muted-foreground">
              Disfruta de nuestra música seleccionada para cada ocasión.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {playlists.map((playlist, idx) => (
                <LinkCard key={idx} name={playlist.name} icon={playlist.icon} url={playlist.url} available={playlist.available} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Más Enlaces */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Más Enlaces</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {moreLinks.map((link, idx) => (
                <LinkCard key={idx} name={link.name} icon={link.icon} url={link.url} description={link.description} />
              ))}
              <div className="opacity-60">
                <div className="flex items-center justify-between p-4 rounded-lg border-2">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-2xl flex-shrink-0">👕</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">Camisetas DAME®</h3>
                      <p className="text-sm text-muted-foreground">¡Consigue tu camiseta oficial!</p>
                      <span className="text-xs text-orange-600 font-medium">Próximamente</span>
                    </div>
                  </div>
                  <div className="text-2xl text-purple-600">🔒</div>
                </div>
              </div>
              <div className="opacity-60">
                <div className="flex items-center justify-between p-4 rounded-lg border-2">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-2xl flex-shrink-0">⭐</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">Evalúanos en Google</h3>
                      <p className="text-sm text-muted-foreground">Comparte tu experiencia con la comunidad</p>
                      <span className="text-xs text-orange-600 font-medium">Próximamente</span>
                    </div>
                  </div>
                  <div className="text-2xl text-purple-600">🔒</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CommunityLinks;

