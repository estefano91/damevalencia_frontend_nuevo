import { useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { dameTicketsAPI } from "@/integrations/dame-api/tickets";
import type { TicketTypeDetail } from "@/types/tickets";

export interface JackJillAttendeeSlice {
  jack_jill_participates: boolean | null;
  instagram: string;
  photo_url: string;
  buyer_photo_image_id: string | null;
}

type JackJillAttendeeFieldsProps = {
  ticketType: TicketTypeDetail;
  isEn: boolean;
  attendeeIndex: number;
  /** Prefijo único para ids accesibles (ej. fullName field index) */
  fieldIdPrefix: string;
  value: JackJillAttendeeSlice;
  onChange: (patch: Partial<JackJillAttendeeSlice>) => void;
  /** +1 al iniciar subida de foto, -1 al terminar (éxito o error), para desactivar el checkout */
  onPhotoUploadDelta?: (delta: 1 | -1) => void;
};

export function jackJillAppliesToTicket(ticketType: TicketTypeDetail): boolean {
  return Boolean(ticketType.is_jack_and_jill || ticketType.require_jack_jill_confirmation);
}

/** Serializa campos JJ para attendee_data según flags del tipo de entrada */
export function buildJackJillPayload(
  ticketType: TicketTypeDetail,
  slice: JackJillAttendeeSlice
): {
  jack_jill_participates?: boolean;
  photo_url?: string;
  instagram?: string;
} {
  const active = jackJillAppliesToTicket(ticketType);
  if (!active) return {};

  const out: { jack_jill_participates?: boolean; photo_url?: string; instagram?: string } = {};

  if (ticketType.require_jack_jill_confirmation && slice.jack_jill_participates !== null) {
    out.jack_jill_participates = slice.jack_jill_participates === true;
  } else if (ticketType.is_jack_and_jill && !ticketType.require_jack_jill_confirmation) {
    out.jack_jill_participates = slice.jack_jill_participates !== false;
  }

  const ig = slice.instagram.trim();
  if (ig) out.instagram = ig;

  const url = slice.photo_url.trim();
  if (url) out.photo_url = url;

  return out;
}

export function validateJackJillSlice(
  ticketType: TicketTypeDetail,
  slice: JackJillAttendeeSlice,
  attendeeLabel: string,
  isEn: boolean
): string | null {
  if (!jackJillAppliesToTicket(ticketType)) return null;

  if (
    ticketType.require_jack_jill_confirmation &&
    slice.jack_jill_participates === null
  ) {
    return isEn
      ? `Please indicate Jack & Jill participation for ${attendeeLabel}`
      : `Indica si participas en Jack & Jill (${attendeeLabel})`;
  }

  if (ticketType.require_photo_url && !slice.photo_url.trim()) {
    return isEn
      ? `Photo is required for ${attendeeLabel}`
      : `La foto es obligatoria para ${attendeeLabel}`;
  }

  if (ticketType.require_instagram && !slice.instagram.trim()) {
    return isEn
      ? `Instagram is required for ${attendeeLabel}`
      : `Instagram es obligatorio para ${attendeeLabel}`;
  }

  return null;
}

export function defaultJackJillSlice(ticketType: TicketTypeDetail): JackJillAttendeeSlice {
  const participates =
    ticketType.require_jack_jill_confirmation
      ? null
      : ticketType.is_jack_and_jill
        ? true
        : null;

  return {
    jack_jill_participates: participates,
    instagram: "",
    photo_url: "",
    buyer_photo_image_id: null,
  };
}

export function JackJillAttendeeFields({
  ticketType,
  isEn,
  attendeeIndex,
  fieldIdPrefix,
  value,
  onChange,
  onPhotoUploadDelta,
}: JackJillAttendeeFieldsProps) {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  if (!jackJillAppliesToTicket(ticketType)) return null;

  const participationLabel = isEn
    ? "Jack & Jill participation"
    : "Participación Jack & Jill";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: isEn ? "Invalid file" : "Archivo no válido",
        description: isEn ? "Please choose an image." : "Elige una imagen.",
        variant: "destructive",
      });
      return;
    }

    const maxMb = 8;
    if (file.size > maxMb * 1024 * 1024) {
      toast({
        title: isEn ? "File too large" : "Archivo demasiado grande",
        description: isEn ? `Max ${maxMb} MB.` : `Máximo ${maxMb} MB.`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    onPhotoUploadDelta?.(1);
    try {
      const res = await dameTicketsAPI.uploadBuyerPhoto(file);
      const uploadedUrl = res.data?.url;
      if (res.success && uploadedUrl) {
        const imageId =
          typeof res.data?.image_id === "string" ? res.data.image_id : null;
        onChange({
          photo_url: uploadedUrl,
          buyer_photo_image_id: imageId,
        });
        toast({
          title: isEn ? "Photo uploaded" : "Foto subida",
          description: isEn ? "You can continue with checkout." : "Puedes continuar con la compra.",
        });
      } else {
        toast({
          title: isEn ? "Upload failed" : "Error al subir",
          description: res.error || (isEn ? "Try again." : "Inténtalo de nuevo."),
          variant: "destructive",
        });
      }
    } finally {
      setUploading(false);
      onPhotoUploadDelta?.(-1);
    }
  };

  const removePhoto = async () => {
    const id = value.buyer_photo_image_id;
    if (id) {
      const res = await dameTicketsAPI.deleteBuyerPhoto(id);
      if (!res.success) {
        toast({
          title: isEn ? "Could not delete photo" : "No se pudo borrar la foto",
          description: res.error,
          variant: "destructive",
        });
        return;
      }
    }
    onChange({ photo_url: "", buyer_photo_image_id: null });
  };

  const photoInputId = `${fieldIdPrefix}-jj-photo-${attendeeIndex}`;

  return (
    <div className="space-y-4 rounded-lg border border-orange-200/80 bg-orange-50/50 p-4 dark:border-orange-900/50 dark:bg-orange-950/20">
      <div className="flex items-center gap-2">
        <span className="text-lg" aria-hidden>
          🎭
        </span>
        <h4 className="font-semibold text-sm sm:text-base">Jack & Jill</h4>
      </div>

      {ticketType.require_jack_jill_confirmation ? (
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {participationLabel} *
          </Label>
          <RadioGroup
            value={
              value.jack_jill_participates === null
                ? ""
                : value.jack_jill_participates
                  ? "yes"
                  : "no"
            }
            onValueChange={(v) =>
              onChange({ jack_jill_participates: v === "yes" })
            }
            className="flex flex-col gap-2 sm:flex-row sm:gap-6"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="yes" id={`${fieldIdPrefix}-jj-yes-${attendeeIndex}`} />
              <Label htmlFor={`${fieldIdPrefix}-jj-yes-${attendeeIndex}`} className="font-normal cursor-pointer">
                {isEn ? "Yes, I participate" : "Sí, participo"}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="no" id={`${fieldIdPrefix}-jj-no-${attendeeIndex}`} />
              <Label htmlFor={`${fieldIdPrefix}-jj-no-${attendeeIndex}`} className="font-normal cursor-pointer">
                {isEn ? "No, I don't participate" : "No participo"}
              </Label>
            </div>
          </RadioGroup>
        </div>
      ) : ticketType.is_jack_and_jill ? (
        <div className="flex items-start gap-3">
          <Checkbox
            id={`${fieldIdPrefix}-jj-optout-${attendeeIndex}`}
            checked={value.jack_jill_participates === false}
            onCheckedChange={(checked) =>
              onChange({
                jack_jill_participates: checked === true ? false : true,
              })
            }
          />
          <div className="grid gap-1 leading-none">
            <Label
              htmlFor={`${fieldIdPrefix}-jj-optout-${attendeeIndex}`}
              className="text-sm font-normal cursor-pointer"
            >
              {isEn
                ? "I will not participate in Jack & Jill"
                : "No participaré en Jack & Jill"}
            </Label>
            <p className="text-xs text-muted-foreground">
              {isEn
                ? "Unchecked means you participate (default for this ticket)."
                : "Si no marcas, damos por hecho que participas."}
            </p>
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor={`${fieldIdPrefix}-jj-insta-${attendeeIndex}`}>
          Instagram {ticketType.require_instagram ? "*" : `(${isEn ? "optional" : "opcional"})`}
        </Label>
        <Input
          id={`${fieldIdPrefix}-jj-insta-${attendeeIndex}`}
          value={value.instagram}
          onChange={(e) => onChange({ instagram: e.target.value })}
          placeholder={isEn ? "@user or profile URL" : "@usuario o URL del perfil"}
          autoComplete="off"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={photoInputId}>
          {isEn ? "Photo" : "Foto"}{" "}
          {ticketType.require_photo_url ? "*" : `(${isEn ? "optional" : "opcional"})`}
        </Label>
        <p className="text-xs text-muted-foreground">
          {isEn
            ? "Upload your photo here first; we send the URL to the server with your ticket."
            : "Sube la foto aquí primero; enviamos la URL al servidor con tu entrada."}
        </p>
        <input
          ref={fileRef}
          id={photoInputId}
          type="file"
          accept="image/*"
          className="sr-only"
          disabled={uploading}
          onChange={handleFileChange}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {uploading
              ? isEn
                ? "Uploading…"
                : "Subiendo…"
              : isEn
                ? "Choose photo"
                : "Elegir foto"}
          </Button>
          {value.photo_url ? (
            <>
              <Button type="button" variant="ghost" size="sm" onClick={() => removePhoto()}>
                <X className="mr-1 h-4 w-4" />
                {isEn ? "Remove" : "Quitar"}
              </Button>
              <span className="text-xs text-muted-foreground truncate max-w-[200px]" title={value.photo_url}>
                {value.photo_url.replace(/^https?:\/\//, "").length > 36
                  ? `${value.photo_url.replace(/^https?:\/\//, "").slice(0, 36)}…`
                  : value.photo_url.replace(/^https?:\/\//, "")}
              </span>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
