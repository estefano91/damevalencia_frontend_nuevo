import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import EventsSection from "@/components/EventsSection";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Demo = () => {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section - Solo para usuarios no logueados */}
      {!user && (
        <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <div className="container mx-auto px-4 py-12 md:py-16 lg:py-20 pb-4 md:pb-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-7xl mx-auto">
              {/* Left Section - Text Content */}
              <div className="space-y-6 text-left">
                {/* Small Headline */}
                <p className="text-sm md:text-base font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  {i18n.language === 'en' ? 'Hello, we are the Association' : 'Hola, somos la Asociación'}
                </p>

                {/* Main Title */}
                <div className="relative">
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-none">
                    DAME
                  </h1>
                  <div className="h-1 w-24 bg-purple-600 dark:bg-purple-400 mt-2"></div>
                </div>

                {/* Description Paragraph 1 */}
                <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed pt-4">
                  {i18n.language === 'en' ? (
                    <>
                      We are a vibrant and diverse community, united by the love of art, culture, and movement. Through workshops, events, and innovative projects, we seek to foster creativity, inclusion, and the well-being of all our members.
                    </>
                  ) : (
                    <>
                      Somos una comunidad vibrante y diversa, unida por el amor al arte, la cultura y el movimiento. A través de talleres, eventos y proyectos innovadores, buscamos fomentar la creatividad, la inclusión y el bienestar de todos nuestros miembros.
                    </>
                  )}
                </p>

                {/* Description Paragraph 2 (Italicized) */}
                <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 italic leading-relaxed">
                  {i18n.language === 'en' ? (
                    <>
                      Our association is a space where minds expand, hearts connect, and dreams come to life.
                    </>
                  ) : (
                    <>
                      Nuestra asociación es un espacio donde las mentes se expanden, los corazones se conectan y los sueños cobran vida.
                    </>
                  )}
                </p>

                {/* CTA Button */}
                <div className="pt-4">
                  <Button
                    size="lg"
                    onClick={() => navigate("/auth")}
                    className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 text-base font-semibold px-8 py-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    {i18n.language === 'en' ? 'Join DAME Valencia' : 'Únete a DAME Valencia'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Right Section - Image */}
              <div className="relative flex items-center justify-center lg:justify-end">
                <div className="relative w-full max-w-lg">
                  <img
                    src="/dame.png"
                    alt="DAME Valencia Community"
                    className="w-full h-auto rounded-lg shadow-2xl object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Eventos DAME por Categoría */}
      <div className="container mx-auto px-4 pt-0 pb-6">
        <EventsSection maxEventsPerCategory={4} />
      </div>
    </div>
  );
};

export default Demo;