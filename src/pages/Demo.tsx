import { useAuth } from "@/contexts/AuthContext";
import { Palette, Music, Heart } from "lucide-react";
import EventsSection from "@/components/EventsSection";

const Demo = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Foto Principal DAME Valencia - Hero Section */}
      <div className="relative w-full h-64 md:h-80 lg:h-96 mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
          {/* Overlay para mejor legibilidad */}
          <div className="absolute inset-0 bg-black/20"></div>
          
          {/* Contenido sobre la imagen */}
          <div className="relative h-full flex items-center justify-center text-center text-white p-4 md:p-8">
            <div className="max-w-4xl">
              <div className="flex justify-center space-x-3 text-4xl md:text-5xl lg:text-6xl mb-4 md:mb-6">
                <Palette className="text-white drop-shadow-lg" />
                <Music className="text-white drop-shadow-lg" />
                <Heart className="text-white drop-shadow-lg" />
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-3 md:mb-4 drop-shadow-xl">
                DAME VALENCIA
              </h1>
              <p className="text-base md:text-lg lg:text-xl xl:text-2xl font-medium drop-shadow-lg max-w-3xl mx-auto mb-2">
                Asociación de Arte, Cultura y Bienestar
              </p>
              <p className="text-sm md:text-base lg:text-lg drop-shadow-lg opacity-90">
                Conectando la comunidad artística de Valencia desde 2023
              </p>
              
              {/* Stats en la imagen */}
              <div className="grid grid-cols-3 gap-2 md:gap-4 mt-4 md:mt-8 max-w-sm md:max-w-md mx-auto">
                <div className="text-center">
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold">10K+</div>
                  <div className="text-xs md:text-sm opacity-90">Miembros</div>
                </div>
                <div className="text-center">
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold">300+</div>
                  <div className="text-xs md:text-sm opacity-90">Eventos</div>
                </div>
                <div className="text-center">
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold">50+</div>
                  <div className="text-xs md:text-sm opacity-90">Países</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Eventos DAME por Categoría - Directamente después de la imagen */}
      <div className="container mx-auto px-4 pb-8">
        <EventsSection maxEventsPerCategory={4} />
      </div>
    </div>
  );
};

export default Demo;