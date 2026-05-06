import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export type MemberDocumentType = "DNI" | "NIE" | "PASAPORTE";

type MemberDocumentTypeSelectProps = {
  id: string;
  value: MemberDocumentType;
  onValueChange: (value: MemberDocumentType) => void;
  isEn: boolean;
  className?: string;
  "aria-invalid"?: boolean;
};

/**
 * Selector nativo: en varios móviles el Radix/shadcn Select falla al abrir o al pulsar opciones.
 * Texto 16px evita zoom al enfocar en iOS. El picker nativo mejora la tactilidad.
 */
export function MemberDocumentTypeSelect({
  id,
  value,
  onValueChange,
  isEn,
  className,
  "aria-invalid": ariaInvalid,
}: MemberDocumentTypeSelectProps) {
  return (
    <div className="relative w-full">
      <select
        id={id}
        name={id}
        value={value}
        aria-invalid={ariaInvalid}
        onChange={(e) => onValueChange(e.target.value as MemberDocumentType)}
        className={cn(
          "flex min-h-12 w-full cursor-pointer appearance-none rounded-md border border-input bg-background py-2 pl-3 pr-10 text-[16px] ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:min-h-10 md:text-sm",
          ariaInvalid && "border-red-500",
          className
        )}
      >
        <option value="DNI">DNI</option>
        <option value="NIE">NIE</option>
        <option value="PASAPORTE">{isEn ? "Passport" : "Pasaporte"}</option>
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground opacity-50"
        aria-hidden
      />
    </div>
  );
}
