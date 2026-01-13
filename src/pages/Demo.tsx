import { useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import EventsSection from "@/components/EventsSection";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";

const Demo = () => {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const eventsSectionRef = useRef<HTMLDivElement>(null);

  const scrollToEvents = () => {
    if (eventsSectionRef.current) {
      const offset = 80; // Offset para compensar headers y padding
      const elementPosition = eventsSectionRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - Solo para usuarios no logueados */}
      {!user && (
        <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <div className="container mx-auto px-4 pt-12 sm:pt-16 md:pt-20 pb-4 md:pb-6">
            <div className="max-w-2xl mx-auto text-center space-y-3 sm:space-y-4">
              {/* Main Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight px-2 pt-2">
                {i18n.language === 'en' ? (
                  <>
                    We show you <span className="text-purple-600 dark:text-purple-400">WHY</span> Valencia is the best city of the world
                  </>
                ) : (
                  <>
                    Te mostramos <span className="text-purple-600 dark:text-purple-400">POR QUÉ</span> Valencia es la mejor ciudad del mundo
                  </>
                )}
              </h1>

              {/* Description */}
              <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto px-2">
                {i18n.language === 'en' ? (
                  <>
                    Discover amazing events and connect with thousands of people in Valencia.
                  </>
                ) : (
                  <>
                    Descubre eventos increíbles y conéctate con miles de personas en Valencia.
                  </>
                )}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center pt-2 sm:pt-3">
                <Button
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 text-sm sm:text-base font-semibold px-6 sm:px-8 py-5 sm:py-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 w-full sm:w-auto"
                >
                  {i18n.language === 'en' ? 'Join DAME' : 'Únete a DAME'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={scrollToEvents}
                  className="border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 text-sm sm:text-base font-semibold px-6 sm:px-8 py-5 sm:py-6 rounded-lg transition-all duration-200 w-full sm:w-auto"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {i18n.language === 'en' ? 'Check Events' : 'Checa los eventos'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Eventos DAME por Categoría */}
      <div className="container mx-auto px-4 pt-0 pb-6">
        <div ref={eventsSectionRef} className="scroll-mt-20"></div>
        <EventsSection maxEventsPerCategory={4} />
      </div>
    </div>
  );
};

export default Demo;