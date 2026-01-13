import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import EventsSection from "@/components/EventsSection";
import { Button } from "@/components/ui/button";
import { Users, Calendar, Heart, ArrowRight } from "lucide-react";

const Demo = () => {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section - Solo para usuarios no logueados */}
      {!user && (
        <div className="bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              {/* Headline con emojis */}
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                {i18n.language === 'en' ? (
                  <>
                    The <span className="text-purple-600">👥</span> people platform. Where <span className="text-orange-500">🎭</span> interests become <span className="text-pink-500">💕</span> friendships.
                  </>
                ) : (
                  <>
                    La plataforma de <span className="text-purple-600">👥</span> personas. Donde los <span className="text-orange-500">🎭</span> intereses se convierten en <span className="text-pink-500">💕</span> amistades.
                  </>
                )}
              </h1>

              {/* Body Text */}
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                {i18n.language === 'en' ? (
                  <>
                    Whatever your interest, from concerts and cultural events to networking and skill sharing, there are thousands of people who share it on DAME Valencia. Events are happening every day—sign up to join the fun.
                  </>
                ) : (
                  <>
                    Cualquiera que sea tu interés, desde conciertos y eventos culturales hasta networking e intercambio de habilidades, hay miles de personas que lo comparten en DAME Valencia. Los eventos ocurren todos los días—regístrate para unirte a la diversión.
                  </>
                )}
              </p>

              {/* CTA Button */}
              <div className="flex justify-center pt-4">
                <Button
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 text-lg px-8 py-6 rounded-lg shadow-lg transition-all duration-200 hover:scale-105"
                >
                  {i18n.language === 'en' ? 'Join DAME Valencia' : 'Únete a DAME Valencia'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>

              {/* Features Icons */}
              <div className="flex flex-wrap justify-center gap-8 pt-8 text-gray-500 dark:text-gray-400">
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                    <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-sm font-medium">
                    {i18n.language === 'en' ? 'Community' : 'Comunidad'}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/30">
                    <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <span className="text-sm font-medium">
                    {i18n.language === 'en' ? 'Events' : 'Eventos'}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 rounded-full bg-pink-100 dark:bg-pink-900/30">
                    <Heart className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <span className="text-sm font-medium">
                    {i18n.language === 'en' ? 'Connections' : 'Conexiones'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Eventos DAME por Categoría */}
      <div className="container mx-auto px-4 py-6">
        <EventsSection maxEventsPerCategory={4} />
      </div>
    </div>
  );
};

export default Demo;