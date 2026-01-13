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
        <div className="bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              {/* Headline */}
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                {i18n.language === 'en' ? (
                  <>
                    We show you <span className="text-purple-600">WHY</span> Valencia is the best city of the world
                  </>
                ) : (
                  <>
                    Te mostramos <span className="text-purple-600">POR QUÉ</span> Valencia es la mejor ciudad del mundo
                  </>
                )}
              </h1>

              {/* Body Text */}
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
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
              <div className="flex justify-center pt-2">
                <Button
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg font-bold px-12 py-8 rounded-xl shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-orange-500/60 ring-4 ring-orange-200 dark:ring-orange-900/30"
                >
                  {i18n.language === 'en' ? 'Join DAME Valencia' : 'Únete a DAME Valencia'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
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