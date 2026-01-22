import { useState, useEffect } from "react";
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
  QrCode,
  Copy,
  Check,
  Crown,
  Star,
  Sparkles,
  ArrowRight,
  Tag,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import QRCode from "qrcode";
import { useToast } from "@/hooks/use-toast";
import { interestsApi } from "@/api/interests";
import type { UserInterest } from "@/types/interests";
import { InterestsModal } from "@/components/InterestsModal";

const UserProfile = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, loading, refreshUser } = useAuth();
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [interests, setInterests] = useState<UserInterest[]>([]);
  const [loadingInterests, setLoadingInterests] = useState(false);
  const [interestsModalOpen, setInterestsModalOpen] = useState(false);

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
    await loadInterests();
    setSyncing(false);
  };

  // Load user interests
  const loadInterests = async () => {
    const accessToken = localStorage.getItem("dame_access_token");
    if (!accessToken) return;

    try {
      setLoadingInterests(true);
      const result = await interestsApi.getInterests(accessToken);

      if (result.ok && result.data) {
        setInterests(result.data.interests);
      }
    } catch (error) {
      console.error("Error loading interests:", error);
    } finally {
      setLoadingInterests(false);
    }
  };

  // Load interests on mount
  useEffect(() => {
    if (user) {
      loadInterests();
    }
  }, [user]);

  const handleInterestsUpdated = () => {
    loadInterests();
    refreshUser();
  };

  const getTagName = (interest: UserInterest) => {
    return i18n.language === "en" ? interest.tag_name_en : interest.tag_name_es;
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

  // Función para generar el código de miembro
  const generateMemberCode = (): string | null => {
    if (!member || !user) return null;
    
    // Mapear tipo de documento a letra
    const documentTypeMap: Record<string, string> = {
      'NIE': 'N',
      'DNI': 'D',
      'PASAPORTE': 'P'
    };
    
    const docLetter = documentTypeMap[member.document_type] || 'D';
    const userId = user.id;
    const docNumber = member.document_number;
    
    return `${userId}-${docLetter}-${docNumber}`;
  };

  const memberCode = generateMemberCode();

  // Generar QR code cuando el código esté disponible
  useEffect(() => {
    if (memberCode) {
      QRCode.toDataURL(memberCode, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      .then((url) => {
        setQrCodeDataUrl(url);
      })
      .catch((err) => {
        console.error('Error generating QR code:', err);
      });
    }
  }, [memberCode]);

  const handleCopyCode = async () => {
    if (!memberCode) return;
    
    try {
      await navigator.clipboard.writeText(memberCode);
      setCopied(true);
      toast({
        title: i18n.language === 'en' ? 'Code copied!' : '¡Código copiado!',
        description: i18n.language === 'en' 
          ? 'Member code has been copied to clipboard' 
          : 'El código de miembro se ha copiado al portapapeles',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying code:', err);
    }
  };

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
        {/* Información de Miembro - Primera card con todo consolidado */}
        <Card className="shadow-md border border-purple-100 dark:border-primary/20">
          <CardHeader className="pb-3 sm:pb-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <IdCard className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>{t("profile.memberInfo")}</span>
                </CardTitle>
              </div>
              {member && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={() => navigate("/suscripcion")}
                    className="bg-purple-600 text-white hover:bg-purple-700 focus:bg-purple-700 w-full sm:w-auto"
                    size="sm"
                  >
                    <span className="text-xs sm:text-sm">
                      {i18n.language === 'en' ? 'Change Plan' : 'Cambiar Plan'}
                    </span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
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
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-6">
            {member ? (
              <>
                {/* Suscripción Actual - Primera sección */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase text-muted-foreground">
                      {i18n.language === 'en' ? 'Current Subscription' : 'Suscripción Actual'}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border bg-muted/30">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        {(member.subscription_type || "FREE") === "VIP" ? (
                          <Crown className="h-8 w-8 text-purple-600" />
                        ) : (member.subscription_type || "FREE") === "SUPER" ? (
                          <Sparkles className="h-8 w-8 text-yellow-600" />
                        ) : (
                          <Star className="h-8 w-8 text-gray-600" />
                        )}
                        <div>
                          <p className="font-semibold text-base sm:text-lg">
                            {(member.subscription_type || "FREE") === "VIP" 
                              ? (i18n.language === 'en' ? 'VIP Member' : 'Miembro VIP')
                              : (member.subscription_type || "FREE") === "SUPER"
                              ? (i18n.language === 'en' ? 'SuperMember' : 'SuperMiembro')
                              : (i18n.language === 'en' ? 'FREE Member' : 'Miembro FREE')}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {(member.subscription_type || "FREE") === "VIP"
                              ? "9,99€/mes"
                              : (member.subscription_type || "FREE") === "SUPER"
                              ? (i18n.language === 'en' ? 'Coming Soon' : 'Próximamente')
                              : (i18n.language === 'en' ? 'Free plan' : 'Plan gratuito')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant={(member.subscription_type || "FREE") === "FREE" ? "secondary" : "default"}
                      className={`${
                        (member.subscription_type || "FREE") === "VIP" 
                          ? "bg-purple-600" 
                          : (member.subscription_type || "FREE") === "SUPER"
                          ? "bg-yellow-600"
                          : ""
                      }`}
                    >
                      {member.subscription_type || "FREE"}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Código de Miembro y QR */}
                {memberCode && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs uppercase text-muted-foreground mb-3">
                        {i18n.language === 'en' ? 'Member Code' : 'Código de Miembro'}
                      </p>
                      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                        {/* QR Code */}
                        {qrCodeDataUrl && (
                          <div className="flex-shrink-0">
                            <div className="bg-white p-4 rounded-lg border-2 border-purple-200 dark:border-purple-800 shadow-sm">
                              <img 
                                src={qrCodeDataUrl} 
                                alt="Member QR Code" 
                                className="w-48 h-48"
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Código */}
                        <div className="flex-1 w-full">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 rounded-lg border-2 border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20 p-3">
                                <p className="font-mono font-bold text-lg sm:text-xl text-purple-900 dark:text-purple-100 break-all">
                                  {memberCode}
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={handleCopyCode}
                                className="h-10 w-10 flex-shrink-0"
                                title={i18n.language === 'en' ? 'Copy code' : 'Copiar código'}
                              >
                                {copied ? (
                                  <Check className="h-5 w-5 text-green-600" />
                                ) : (
                                  <Copy className="h-5 w-5" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Separator />
                  </div>
                )}

                {/* Datos del Miembro */}
                <div className="space-y-4">
                  <p className="text-xs uppercase text-muted-foreground">
                    {i18n.language === 'en' ? 'Member Details' : 'Datos del Miembro'}
                  </p>
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
                </div>
              </>
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
                    <span className="text-sm">{i18n.language === 'en' ? 'Become DAME Member' : 'Hazte Miembro DAME'}</span>
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

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

        {/* Intereses */}
        <Card className="shadow-md border border-purple-100 dark:border-primary/20">
          <CardHeader className="pb-3 sm:pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Tag className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>
                    {i18n.language === "en" ? "My Interests" : "Mis Intereses"}
                  </span>
                </CardTitle>
              </div>
              <Button
                onClick={() => setInterestsModalOpen(true)}
                className="bg-purple-600 text-white hover:bg-purple-700 focus:bg-purple-700 w-full sm:w-auto"
                size="sm"
              >
                <Edit2 className="mr-2 h-4 w-4" />
                <span className="text-xs sm:text-sm">
                  {i18n.language === "en" ? "Edit Interests" : "Editar Intereses"}
                </span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {loadingInterests ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : interests.length === 0 ? (
              <Alert variant="secondary">
                <Tag className="h-4 w-4" />
                <AlertTitle className="text-sm sm:text-base">
                  {i18n.language === "en" ? "No interests selected" : "Sin intereses seleccionados"}
                </AlertTitle>
                <AlertDescription className="mt-2">
                  <p className="text-sm mb-3">
                    {i18n.language === "en"
                      ? "Select your interests to personalize your experience"
                      : "Selecciona tus intereses para personalizar tu experiencia"}
                  </p>
                  <Button
                    onClick={() => setInterestsModalOpen(true)}
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {i18n.language === "en" ? "Add Interests" : "Agregar Intereses"}
                  </Button>
                </AlertDescription>
              </Alert>
            ) : (
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <Badge
                    key={interest.id}
                    variant="default"
                    className="px-3 py-1.5 text-sm bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                  >
                    {getTagName(interest)}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Interests Modal */}
      <InterestsModal
        open={interestsModalOpen}
        onOpenChange={setInterestsModalOpen}
        onSuccess={handleInterestsUpdated}
        isFirstTime={false}
      />
    </div>
  );
};

export default UserProfile;

