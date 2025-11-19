import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/api/auth";
import type { UserStats } from "@/types/auth";
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
  BarChart3,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const UserProfile = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, loading, refreshUser } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

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

  const loadStats = async () => {
    const accessToken = localStorage.getItem('dame_access_token');
    if (!accessToken) return;

    setLoadingStats(true);
    try {
      const result = await authApi.getUserStats(accessToken);
      if (result.ok && result.data?.success && result.data.stats) {
        setStats(result.data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const handleSync = async () => {
    setSyncing(true);
    await refreshUser();
    await loadStats();
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
      <nav className="sticky top-0 z-10 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b px-3 sm:px-4 py-3 flex flex-wrap items-center gap-3 sm:gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("profile.myProfile")}</p>
          <p className="text-lg font-semibold leading-tight">{t("profile.personalInfo")}</p>
        </div>
        <div className="flex flex-col min-[480px]:flex-row items-start min-[480px]:items-center gap-2 ml-auto w-full min-[480px]:w-auto">
          <p className="text-xs text-muted-foreground order-2 min-[480px]:order-1 w-full">
            {t("profile.lastUpdate")}: {formatDate(user.updated_at)}
          </p>
          <Button
            variant="outline"
            onClick={handleSync}
            disabled={syncing}
            className="order-1 min-[480px]:order-2 w-full min-[480px]:w-auto"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            {t("profile.update")}
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
                  ID #{user.id} · {user.active ? t("profile.active") : t("profile.inactive")}
                </p>
              </div>
              <Badge variant={user.active ? "default" : "secondary"}>
                {user.active ? t("profile.active") : t("profile.inactive")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs uppercase text-muted-foreground">{t("profile.email")}</p>
                <div className="flex items-center gap-2 mt-1 font-semibold">
                  <Mail className="h-4 w-4 text-primary" />
                  {user.email}
                </div>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs uppercase text-muted-foreground">{t("profile.username")}</p>
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
                  {t("profile.registrationDate")}
                </p>
                <div className="flex items-center gap-2 mt-1 font-semibold">
                  <Calendar className="h-4 w-4 text-primary" />
                  {formatDate(user.created_at)}
                </div>
              </div>
              <div className="rounded-lg border bg-muted/20 p-4">
                <p className="text-xs uppercase text-muted-foreground">
                  {t("profile.lastUpdate")}
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
              {t("profile.memberInfo")}
            </CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t("profile.memberInfoDesc")}
            </p>
          </CardHeader>
          <CardContent>
            {member ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border p-4 space-y-1">
                  <p className="text-xs uppercase text-muted-foreground">
                    {t("profile.fullName")}
                  </p>
                  <p className="font-semibold">{member.full_name}</p>
                </div>
                <div className="rounded-lg border p-4 space-y-1">
                  <p className="text-xs uppercase text-muted-foreground">{t("profile.document")}</p>
                  <p className="font-semibold">
                    {member.document_type} · {member.document_number}
                  </p>
                </div>
                <div className="rounded-lg border p-4 space-y-1">
                  <p className="text-xs uppercase text-muted-foreground">
                    {t("profile.birthDate")}
                  </p>
                  <p className="font-semibold">{formatDate(member.birth_date)}</p>
                </div>
                <div className="rounded-lg border p-4 space-y-1">
                  <p className="text-xs uppercase text-muted-foreground">{t("profile.age")}</p>
                  <p className="font-semibold">{member.age ?? "—"} {t("profile.years")}</p>
                </div>
                <div className="rounded-lg border p-4 space-y-1">
                  <p className="text-xs uppercase text-muted-foreground">
                    {t("profile.affiliationStatus")}
                  </p>
                  <Badge variant={member.is_active ? "default" : "secondary"}>
                    {member.is_active ? t("profile.active") : t("profile.inactive")}
                  </Badge>
                </div>
                <div className="rounded-lg border p-4 space-y-1">
                  <p className="text-xs uppercase text-muted-foreground">
                    {t("profile.enrollmentDate")}
                  </p>
                  <p className="font-semibold">{formatDate(member.created_at)}</p>
                </div>
              </div>
            ) : (
              <Alert variant="secondary">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t("profile.noAffiliation")}</AlertTitle>
                <AlertDescription className="space-y-3">
                  <p>{t("profile.noAffiliationDesc")}</p>
                  <Button
                    onClick={() => navigate("/afiliarse")}
                    className="w-full sm:w-auto"
                    size="sm"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {i18n.language === 'en' ? 'Join Benefits Program' : 'Afiliarse al Programa'}
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Estadísticas del Usuario */}
        {stats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-primary" />
                {i18n.language === 'en' ? 'User Statistics' : 'Estadísticas del Usuario'}
              </CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {i18n.language === 'en' 
                  ? 'Overview of your account and membership information'
                  : 'Resumen de la información de tu cuenta y membresía'}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="rounded-lg border bg-muted/20 p-4 space-y-1">
                  <p className="text-xs uppercase text-muted-foreground">
                    {i18n.language === 'en' ? 'Registration Date' : 'Fecha de Registro'}
                  </p>
                  <p className="font-semibold">{formatDate(stats.registration_date)}</p>
                </div>
                <div className="rounded-lg border bg-muted/20 p-4 space-y-1">
                  <p className="text-xs uppercase text-muted-foreground">
                    {i18n.language === 'en' ? 'Status' : 'Estado'}
                  </p>
                  <Badge variant={stats.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {stats.status}
                  </Badge>
                </div>
                <div className="rounded-lg border bg-muted/20 p-4 space-y-1">
                  <p className="text-xs uppercase text-muted-foreground">
                    {i18n.language === 'en' ? 'Account Status' : 'Estado de la Cuenta'}
                  </p>
                  <Badge variant={stats.is_blocked ? 'destructive' : 'default'}>
                    {stats.is_blocked 
                      ? (i18n.language === 'en' ? 'Blocked' : 'Bloqueado')
                      : (i18n.language === 'en' ? 'Active' : 'Activo')}
                  </Badge>
                </div>
                <div className="rounded-lg border bg-muted/20 p-4 space-y-1">
                  <p className="text-xs uppercase text-muted-foreground">
                    {i18n.language === 'en' ? 'Has Member' : 'Tiene Miembro'}
                  </p>
                  <Badge variant={stats.has_member ? 'default' : 'secondary'}>
                    {stats.has_member 
                      ? (i18n.language === 'en' ? 'Yes' : 'Sí')
                      : (i18n.language === 'en' ? 'No' : 'No')}
                  </Badge>
                </div>
                {stats.has_member && stats.member_since && (
                  <div className="rounded-lg border bg-muted/20 p-4 space-y-1">
                    <p className="text-xs uppercase text-muted-foreground">
                      {i18n.language === 'en' ? 'Member Since' : 'Miembro Desde'}
                    </p>
                    <p className="font-semibold">{formatDate(stats.member_since)}</p>
                  </div>
                )}
                {stats.has_member && stats.member_age !== null && stats.member_age !== undefined && (
                  <div className="rounded-lg border bg-muted/20 p-4 space-y-1">
                    <p className="text-xs uppercase text-muted-foreground">
                      {i18n.language === 'en' ? 'Member Age' : 'Edad del Miembro'}
                    </p>
                    <p className="font-semibold">{stats.member_age} {i18n.language === 'en' ? 'years' : 'años'}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserProfile;

