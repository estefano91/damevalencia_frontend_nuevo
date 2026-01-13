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
        <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <div className="container mx-auto px-4 py-8 md:py-12 pb-4 md:pb-6">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              {/* Headline */}
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-[1.1] tracking-tight">
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

              {/* Body Text */}
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto leading-relaxed pt-2">
                {i18n.language === 'en' ? (
                  <>
                    Discover amazing events and connect with thousands of people in Valencia. Join us today!
                  </>
                ) : (
                  <>
                    Descubre eventos increíbles y conéctate con miles de personas en Valencia. ¡Únete hoy!
                  </>
                )}
              </p>

              {/* CTA Button */}
              <div className="flex justify-center pt-4">
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