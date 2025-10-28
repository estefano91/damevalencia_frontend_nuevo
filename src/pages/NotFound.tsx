import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, ArrowLeft, Palette, Music, Heart } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 text-center space-y-6">
        {/* DAME Logo */}
        <div className="flex justify-center space-x-2 text-4xl mb-4">
          <Palette className="text-purple-600" />
          <Music className="text-pink-600" />
          <Heart className="text-red-500" />
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-purple-600">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            Página no encontrada
          </h2>
          <p className="text-muted-foreground">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button 
            onClick={() => navigate("/")}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Home className="mr-2 h-4 w-4" />
            Volver al Inicio
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate(-1)}
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver Atrás
          </Button>
        </div>

        {/* Contact Info */}
        <div className="pt-4 border-t text-sm text-muted-foreground">
          <p>¿Necesitas ayuda?</p>
          <p className="font-medium text-purple-600">
            📧 admin@organizaciondame.org
          </p>
          <p className="font-medium text-purple-600">
            📞 (+34) 64 40 70 282
          </p>
        </div>

        {/* Footer */}
        <div className="text-xs text-muted-foreground pt-2">
          <p>Asociación DAME - Valencia, España</p>
          <p className="text-purple-600 font-medium">
            Arte • Cultura • Música • Bienestar
          </p>
        </div>
      </Card>
    </div>
  );
};

export default NotFound;