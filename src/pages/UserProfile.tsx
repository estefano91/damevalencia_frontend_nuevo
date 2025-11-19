import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  Plus,
  Edit2,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const UserProfile = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, loading, refreshUser } = useAuth();
  const [syncing, setSyncing] = useState(false);

  const formatDate = (value?: string) => {
    if (!value) return "—";
    try {
      const locale = i18n.language === 'en' ? 'en-US' : 'es-ES';
      return new Date(value).toLocaleDateString(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return value;
    }
  };

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
          <AlertTitle>{t("profile.sessionUnavailable")}</AlertTitle>
          <AlertDescription>
            {t("profile.sessionUnavailableDesc")}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const member = user.member;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-white dark:from-gray-900 dark:to-gray-950">
      <nav className="sticky top-0 z-10 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-wide text-muted-foreground truncate">{t("profile.myProfile")}</p>
            <p className="text-base sm:text-lg font-semibold leading-tight truncate">{t("profile.personalInfo")}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={handleSync}
              disabled={syncing}
              className="w-full sm:w-auto text-sm"
              size="sm"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
              {t("profile.update")}
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2 hidden sm:block">
          {t("profile.lastUpdate")}: {formatDate(user.updated_at)}
        </p>
      </nav>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6">
        <Card className="shadow-md border border-purple-100 dark:border-primary/20">
          <CardHeader className="pb-3 sm:pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg sm:text-xl md:text-2xl flex items-center gap-2 flex-wrap">
                  <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                  <span className="break-words">{user.full_name}</span>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  ID #{user.id} · {user.active ? t("profile.active") : t("profile.inactive")}
                </p>
              </div>
              <Badge variant={user.active ? "default" : "secondary"} className="self-start sm:self-center">
                {user.active ? t("profile.active") : t("profile.inactive")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="flex justify-end">
              <Button
                onClick={() => navigate("/editar-perfil")}
                className="bg-orange-500 text-white hover:bg-orange-600 focus:bg-orange-600 w-full sm:w-auto"
                size="sm"
              >
                <Edit2 className="mr-2 h-4 w-4" />
                <span className="text-sm">{i18n.language === 'en' ? 'Edit Profile' : 'Editar Perfil'}</span>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-lg border bg-muted/30 p-3 sm:p-4">
                <p className="text-xs uppercase text-muted-foreground mb-2">{t("profile.email")}</p>
                <div className="flex items-center gap-2 font-semibold text-sm sm:text-base break-words">
                  <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="min-w-0 break-all">{user.email}</span>
                </div>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3 sm:p-4">
                <p className="text-xs uppercase text-muted-foreground mb-2">{t("profile.username")}</p>
                <div className="flex items-center gap-2 font-semibold text-sm sm:text-base break-words">
                  <ShieldCheck className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="min-w-0 break-all">{user.email}</span>
                </div>
              </div>
            </div>

            <Separator className="my-3 sm:my-4" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-lg border bg-muted/20 p-3 sm:p-4">
                <p className="text-xs uppercase text-muted-foreground mb-2">
                  {t("profile.registrationDate")}
                </p>
                <div className="flex items-center gap-2 font-semibold text-sm sm:text-base">
                  <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="break-words">{formatDate(user.created_at)}</span>
                </div>
              </div>
              <div className="rounded-lg border bg-muted/20 p-3 sm:p-4">
                <p className="text-xs uppercase text-muted-foreground mb-2">
                  {t("profile.lastUpdate")}
                </p>
                <div className="flex items-center gap-2 font-semibold text-sm sm:text-base">
                  <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="break-words">{formatDate(user.updated_at)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <IdCard className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>{t("profile.memberInfo")}</span>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {t("profile.memberInfoDesc")}
                </p>
              </div>
              {member && (
                <Button
                  onClick={() => navigate("/editar-miembro")}
                  className="bg-orange-500 text-white hover:bg-orange-600 focus:bg-orange-600 w-full sm:w-auto"
                  size="sm"
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  <span className="text-xs sm:text-sm">
                    {i18n.language === 'en' ? 'Edit Member Info' : 'Editar Información de Miembro'}
                  </span>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {member ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="rounded-lg border p-3 sm:p-4 space-y-1">
                  <p className="text-xs uppercase text-muted-foreground mb-2">
                    {t("profile.fullName")}
                  </p>
                  <p className="font-semibold text-sm sm:text-base break-words">{member.full_name}</p>
                </div>
                <div className="rounded-lg border p-3 sm:p-4 space-y-1">
                  <p className="text-xs uppercase text-muted-foreground mb-2">{t("profile.document")}</p>
                  <p className="font-semibold text-sm sm:text-base break-words">
                    {member.document_type} · {member.document_number}
                  </p>
                </div>
                <div className="rounded-lg border p-3 sm:p-4 space-y-1">
                  <p className="text-xs uppercase text-muted-foreground mb-2">
                    {t("profile.birthDate")}
                  </p>
                  <p className="font-semibold text-sm sm:text-base break-words">{formatDate(member.birth_date)}</p>
                </div>
                <div className="rounded-lg border p-3 sm:p-4 space-y-1">
                  <p className="text-xs uppercase text-muted-foreground mb-2">{t("profile.age")}</p>
                  <p className="font-semibold text-sm sm:text-base">{member.age ?? "—"} {t("profile.years")}</p>
                </div>
                <div className="rounded-lg border p-3 sm:p-4 space-y-1">
                  <p className="text-xs uppercase text-muted-foreground mb-2">
                    {t("profile.affiliationStatus")}
                  </p>
                  <Badge variant={member.is_active ? "default" : "secondary"} className="text-xs">
                    {member.is_active ? t("profile.active") : t("profile.inactive")}
                  </Badge>
                </div>
                <div className="rounded-lg border p-3 sm:p-4 space-y-1">
                  <p className="text-xs uppercase text-muted-foreground mb-2">
                    {i18n.language === 'en' ? 'Member Since' : 'Miembro Desde'}
                  </p>
                  <p className="font-semibold text-sm sm:text-base break-words">{formatDate(member.created_at)}</p>
                </div>
              </div>
            ) : (
              <Alert variant="secondary" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="text-sm sm:text-base">{t("profile.noAffiliation")}</AlertTitle>
                <AlertDescription className="space-y-3 mt-2">
                  <p className="text-sm">{t("profile.noAffiliationDesc")}</p>
                  <Button
                    onClick={() => navigate("/afiliarse")}
                    className="w-full sm:w-auto"
                    size="sm"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    <span className="text-sm">{i18n.language === 'en' ? 'Join Benefits Program' : 'Afiliarse al Programa'}</span>
                  </Button>
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

