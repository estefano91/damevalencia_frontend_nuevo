import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Home, ArrowLeft, Instagram, Music, Send, Shirt, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import WhatsAppIcon from "@/assets/WhatsApp.svg.webp";

const CommunityLinks = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  
  // Comunidades con WhatsApp e Instagram agrupados
  const communities = [
    { 
      name: "Salsa", 
      icon: "💃", 
      whatsapp: { name: "Comunidad Salsa", url: "https://chat.whatsapp.com/JhtzEylNaAT1EnHQmNi3Dc" },
      instagram: { name: "Salsa", url: "https://instagram.com/damecasino.valencia" },
      playlist: { name: "Playlist Salsa", url: "https://tr.ee/rxAq80wTFl", available: true }
    },
    { 
      name: "Bachata", 
      icon: "🕺", 
      whatsapp: { name: "Comunidad Bachata", url: "https://chat.whatsapp.com/GSfzCHspYY1LJxmbozWc1m" },
      instagram: { name: "Bachata", url: "https://instagram.com/damebachata.valencia" },
      playlist: { name: "Playlist Bachata", url: "https://open.spotify.com/playlist/3WSWPJ8h8IfFSFplRMIVOF" }
    },
    { 
      name: "Volley", 
      icon: "🏐", 
      whatsapp: { name: "Volley", url: "https://chat.whatsapp.com/Ife0riSxN0H7R9woN8BkGC" },
      instagram: { name: "Volley Valencia", url: "https://instagram.com/valenciavolley" },
      playlist: null
    },
    { 
      name: "Zen", 
      icon: "🧘", 
      whatsapp: { name: "Actividades Zen", url: "https://chat.whatsapp.com/CFgD6wStj2q7PJjiY633qY" },
      instagram: { name: "Zen", url: "https://instagram.com/valenciazen.official" },
      playlist: null
    },
    { 
      name: "Fútbol", 
      icon: "⚽", 
      whatsapp: { name: "Comunidad Fútbol", url: "https://chat.whatsapp.com/GLTEVz2YjVTAq7F6JgXPeO" },
      instagram: { name: "Sports", url: "https://instagram.com/damefit.valencia" },
      playlist: null
    },
    { 
      name: "Música", 
      icon: "🎵", 
      whatsapp: { name: "Música (Jam Sessions)", url: "https://chat.whatsapp.com/HYnZYcXgAti3XrBRPtqyWv" },
      instagram: { name: "Música (Jam Sessions)", url: "https://instagram.com/damemusica.valencia" },
      playlist: null
    },
    { 
      name: "Baloncesto", 
      icon: "🏀", 
      whatsapp: { name: "Comunidad Baloncesto", url: "https://chat.whatsapp.com/CtLfrELuYQjFxzvYiw61fX" },
      instagram: null,
      playlist: null
    },
    { 
      name: "Apoyo Social", 
      icon: "🤝", 
      whatsapp: [
        { name: "Segunda Mano", url: "https://chat.whatsapp.com/CxYGgGTreDvGqpbOO0bWqq" },
        { name: "Búsqueda de Empleo DAME", url: "https://chat.whatsapp.com/KfjUGTqVbel38etVlAQ9nu" },
        { name: "Vivienda DAME", url: "https://chat.whatsapp.com/KrX2FJBXF336sy2ZlyHYh0" },
      ],
      instagram: { name: "Apoyo Social e Integración Comunitaria", url: "https://instagram.com/dameapoyo.vlc" },
      playlist: null
    },
    {
      name: "General",
      icon: "🌐",
      whatsapp: { name: "Planes VLC", url: null },
      instagram: null,
      playlist: null,
      extras: [
        { type: "telegram", name: "Canal Telegram DAME", url: "https://t.me/damevalencia" },
        { type: "merch", name: "Camiseta Oficial DAME", url: "/camiseta", isInternal: true },
        { type: "google", name: "Evalúanos en Google", url: null },
      ]
    },
  ];

  const moreLinks: Array<{ name: string; icon: string; url: string | null; description?: string; available?: boolean }> = [];

  const CommunityCard = ({ community }: { community: typeof communities[0] }) => {
    return (
      <Card className="hover:shadow-lg transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-3xl flex-shrink-0">{community.icon}</div>
            <h3 className="font-bold text-xl">{community.name}</h3>
          </div>
          
          <div className="space-y-3">
            {/* WhatsApp Links - puede ser uno o múltiples */}
            {community.whatsapp && (
              <>
                {Array.isArray(community.whatsapp) ? (
                  // Múltiples grupos de WhatsApp (como Apoyo Social)
                  community.whatsapp.map((wa, idx) => (
                    <a 
                      key={idx}
                      href={wa.url || undefined} 
                      target={wa.url ? "_blank" : undefined} 
                      rel={wa.url ? "noopener noreferrer" : undefined}
                      className={`flex items-center justify-between p-3 rounded-lg border-2 border-green-500/30 transition-all duration-200 ${wa.url ? "bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/20 group" : "bg-gray-50 dark:bg-gray-800/50 opacity-60"}`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <img 
                          src={WhatsAppIcon} 
                          alt="WhatsApp" 
                          className="w-6 h-6 flex-shrink-0"
                        />
                        <span className="font-medium text-green-700 dark:text-green-400">{wa.name}</span>
                      </div>
                      {wa.url ? (
                        <ExternalLink className="h-4 w-4 text-green-600 group-hover:translate-x-1 transition-transform" />
                      ) : (
                        <span className="text-xs text-orange-600 font-medium">
                          {i18n.language === 'en' ? 'Coming soon' : 'Próximamente'}
                        </span>
                      )}
                    </a>
                  ))
                ) : (
                  // Un solo grupo de WhatsApp
                  <a 
                    href={community.whatsapp.url || undefined} 
                    target={community.whatsapp.url ? "_blank" : undefined} 
                    rel={community.whatsapp.url ? "noopener noreferrer" : undefined}
                    className={`flex items-center justify-between p-3 rounded-lg border-2 border-green-500/30 transition-all duration-200 ${community.whatsapp.url ? "bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/20 group" : "bg-gray-50 dark:bg-gray-800/50 opacity-60"}`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <img 
                        src={WhatsAppIcon} 
                        alt="WhatsApp" 
                        className="w-6 h-6 flex-shrink-0"
                      />
                      <span className="font-medium text-green-700 dark:text-green-400">{community.whatsapp.name}</span>
                    </div>
                    {community.whatsapp.url ? (
                      <ExternalLink className="h-4 w-4 text-green-600 group-hover:translate-x-1 transition-transform" />
                    ) : (
                      <span className="text-xs text-orange-600 font-medium">
                        {i18n.language === 'en' ? 'Coming soon' : 'Próximamente'}
                      </span>
                    )}
                  </a>
                )}
              </>
            )}
            
            {/* Instagram Link */}
            {community.instagram && (
              <a 
                href={community.instagram.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg border-2 border-pink-500/30 bg-pink-50 dark:bg-pink-900/10 hover:bg-pink-100 dark:hover:bg-pink-900/20 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Instagram className="w-6 h-6 text-pink-600 flex-shrink-0" />
                  <span className="font-medium text-pink-700 dark:text-pink-400">{community.instagram.name}</span>
                </div>
                <ExternalLink className="h-4 w-4 text-pink-600 group-hover:translate-x-1 transition-transform" />
              </a>
            )}
            
            {/* Playlist Link */}
            {community.playlist && (
              <>
                {community.playlist.url ? (
                  <a 
                    href={community.playlist.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg border-2 border-purple-500/30 bg-purple-50 dark:bg-purple-900/10 hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Music className="w-6 h-6 text-purple-600 flex-shrink-0" />
                      <span className="font-medium text-purple-700 dark:text-purple-400">{community.playlist.name}</span>
                    </div>
                    <ExternalLink className="h-4 w-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
                  </a>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-lg border-2 border-gray-300 bg-gray-50 dark:bg-gray-800/50 opacity-60">
                    <div className="flex items-center gap-3 flex-1">
                      <Music className="w-6 h-6 text-gray-500 flex-shrink-0" />
                      <span className="font-medium text-gray-600 dark:text-gray-400">{community.playlist.name}</span>
                    </div>
                    <span className="text-xs text-orange-600 font-medium">{i18n.language === 'en' ? 'Coming soon' : 'Próximamente'}</span>
                  </div>
                )}
              </>
            )}

            {/* Extras */}
            {community.extras && community.extras.length > 0 && (
              <div className="space-y-2">
                {community.extras.map((extra, idx) => {
                  const isAvailable = Boolean(extra.url);
                  const baseClasses = "flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200";
                  const styles = (() => {
                    switch (extra.type) {
                      case "telegram":
                        return `${isAvailable ? "border-blue-500/30 bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20" : "border-gray-300 bg-gray-50 dark:bg-gray-800/50 opacity-60"}`;
                      case "merch":
                        return `${isAvailable ? "border-indigo-500/30 bg-indigo-50 dark:bg-indigo-900/10 hover:bg-indigo-100 dark:hover:bg-indigo-900/20" : "border-gray-300 bg-gray-50 dark:bg-gray-800/50 opacity-60"}`;
                      case "google":
                        return `${isAvailable ? "border-amber-500/30 bg-amber-50 dark:bg-amber-900/10 hover:bg-amber-100 dark:hover:bg-amber-900/20" : "border-gray-300 bg-gray-50 dark:bg-gray-800/50 opacity-60"}`;
                      default:
                        return `${isAvailable ? "border-purple-500/30 bg-purple-50 dark:bg-purple-900/10 hover:bg-purple-100 dark:hover:bg-purple-900/20" : "border-gray-300 bg-gray-50 dark:bg-gray-800/50 opacity-60"}`;
                    }
                  })();
                  const icon = (() => {
                    switch (extra.type) {
                      case "telegram":
                        return <Send className="w-6 h-6 text-blue-600 flex-shrink-0" />;
                      case "merch":
                        return <Shirt className="w-6 h-6 text-indigo-600 flex-shrink-0" />;
                      case "google":
                        return <Star className="w-6 h-6 text-amber-500 flex-shrink-0" />;
                      default:
                        return <ExternalLink className="w-6 h-6 text-purple-600 flex-shrink-0" />;
                    }
                  })();

                  const row = (
                    <div className={`${baseClasses} ${styles}`}>
                      <div className="flex items-center gap-3 flex-1">
                        {icon}
                        <span className="font-medium text-gray-800 dark:text-gray-100">{extra.name}</span>
                      </div>
                      {isAvailable ? (
                        <ExternalLink className="h-4 w-4 text-gray-600 group-hover:translate-x-1 transition-transform" />
                      ) : (
                        <span className="text-xs text-orange-600 font-medium">
                          {i18n.language === 'en' ? 'Coming soon' : 'Próximamente'}
                        </span>
                      )}
                    </div>
                  );

                  const handleClick = (e: React.MouseEvent) => {
                    if (extra.isInternal && extra.url) {
                      e.preventDefault();
                      navigate(extra.url);
                    }
                  };

                  return isAvailable ? (
                    extra.isInternal ? (
                      <div key={idx} onClick={handleClick} className="cursor-pointer">
                        {row}
                      </div>
                    ) : (
                      <a key={idx} href={extra.url || undefined} target="_blank" rel="noopener noreferrer">
                        {row}
                      </a>
                    )
                  ) : (
                    <div key={idx}>{row}</div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

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
            {i18n.language === 'en' ? 'Back to home' : 'Volver al inicio'}
          </Button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 dame-text-gradient">
            {i18n.language === 'en' ? 'DAME Valencia Community' : 'Comunidad DAME Valencia'}
          </h1>
          <p className="text-xl text-muted-foreground">
            {i18n.language === 'en' ? 'Connect with our specialized communities' : 'Conecta con nuestras comunidades especializadas'}
          </p>
        </div>

        {/* Comunidades */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{i18n.language === 'en' ? 'Our Communities' : 'Nuestras Comunidades'}</CardTitle>
            <p className="text-muted-foreground">
              {i18n.language === 'en' ? 'Join our WhatsApp groups and follow us on Instagram to stay connected with each community.' : 'Únete a nuestros grupos de WhatsApp y síguenos en Instagram para mantenerte conectado con cada comunidad.'}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {communities.map((community, idx) => (
                <CommunityCard key={idx} community={community} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Más Enlaces */}
        {moreLinks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{i18n.language === 'en' ? 'More Links' : 'Más Enlaces'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {moreLinks.map((link, idx) => (
                  <LinkCard key={idx} name={link.name} icon={link.icon} url={link.url} description={link.description} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CommunityLinks;


