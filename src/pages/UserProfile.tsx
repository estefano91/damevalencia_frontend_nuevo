import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  Calendar,
  IdCard,
  Loader2,
  Mail,
  RefreshCw,
  ShieldCheck,
  User,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formatDate = (value?: string) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return value;
  }
};

const UserProfile = () => {
  const { user, loading, refreshUser } = useAuth();
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    await refreshUser();
    setSyncing(false);
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Sesión no disponible</AlertTitle>
          <AlertDescription>
            No pudimos cargar tu perfil. Inicia sesión nuevamente para continuar.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const member = user.member;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-white dark:from-gray-900 dark:to-gray-950">
      <nav className="sticky top-0 z-10 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b px-3 sm:px-4 py-3 flex flex-wrap items-center gap-3 sm:gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Mi perfil</p>
          <p className="text-lg font-semibold leading-tight">Información personal</p>
        </div>
        <div className="flex flex-col min-[480px]:flex-row items-start min-[480px]:items-center gap-2 ml-auto w-full min-[480px]:w-auto">
          <p className="text-xs text-muted-foreground order-2 min-[480px]:order-1 w-full">
            Última actualización: {formatDate(user.updated_at)}
          </p>
          <Button
            variant="outline"
            onClick={handleSync}
            disabled={syncing}
            className="order-1 min-[480px]:order-2 w-full min-[480px]:w-auto"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-6">
        <Card className="shadow-md border border-purple-100 dark:border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl sm:text-2xl flex items-center gap-2 flex-wrap">
                  <User className="h-6 w-6 text-primary" />
                  {user.full_name}
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  ID #{user.id} · {user.active ? "Activo" : "Inactivo"}
                </p>
              </div>
              <Badge variant={user.active ? "default" : "secondary"}>
                {user.active ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs uppercase text-muted-foreground">Correo</p>
                <div className="flex items-center gap-2 mt-1 font-semibold">
                  <Mail className="h-4 w-4 text-primary" />
                  {user.email}
                </div>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs uppercase text-muted-foreground">Username</p>
                <div className="flex items-center gap-2 mt-1 font-semibold">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  {user.email}
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border bg-muted/20 p-4">
                <p className="text-xs uppercase text-muted-foreground">
                  Fecha de registro
                </p>
                <div className="flex items-center gap-2 mt-1 font-semibold">
                  <Calendar className="h-4 w-4 text-primary" />
                  {formatDate(user.created_at)}
                </div>
              </div>
              <div className="rounded-lg border bg-muted/20 p-4">
                <p className="text-xs uppercase text-muted-foreground">
                  Última actualización
                </p>
                <div className="flex items-center gap-2 mt-1 font-semibold">
                  <Calendar className="h-4 w-4 text-primary" />
                  {formatDate(user.updated_at)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <IdCard className="h-5 w-5 text-primary" />
              Información de miembro
            </CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Los datos del miembro provienen de la asociación. Si aún no tienes
              afiliación, esta sección aparecerá vacía.
            </p>
          </CardHeader>
          <CardContent>
            {member ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border p-4 space-y-1">
                  <p className="text-xs uppercase text-muted-foreground">
                    Nombre completo
                  </p>
                  <p className="font-semibold">{member.full_name}</p>
                </div>
                <div className="rounded-lg border p-4 space-y-1">
                  <p className="text-xs uppercase text-muted-foreground">Documento</p>
                  <p className="font-semibold">
                    {member.document_type} · {member.document_number}
                  </p>
                </div>
                <div className="rounded-lg border p-4 space-y-1">
                  <p className="text-xs uppercase text-muted-foreground">
                    Fecha de nacimiento
                  </p>
                  <p className="font-semibold">{formatDate(member.birth_date)}</p>
                </div>
                <div className="rounded-lg border p-4 space-y-1">
                  <p className="text-xs uppercase text-muted-foreground">Edad</p>
                  <p className="font-semibold">{member.age ?? "—"} años</p>
                </div>
                <div className="rounded-lg border p-4 space-y-1">
                  <p className="text-xs uppercase text-muted-foreground">
                    Estado de afiliación
                  </p>
                  <Badge variant={member.is_active ? "default" : "secondary"}>
                    {member.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                <div className="rounded-lg border p-4 space-y-1">
                  <p className="text-xs uppercase text-muted-foreground">
                    Fecha de alta
                  </p>
                  <p className="font-semibold">{formatDate(member.created_at)}</p>
                </div>
              </div>
            ) : (
              <Alert variant="secondary">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Sin afiliación registrada</AlertTitle>
                <AlertDescription>
                  Tu cuenta aún no está vinculada a un miembro activo. Contacta con
                  la organización para completar tu registro.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;

