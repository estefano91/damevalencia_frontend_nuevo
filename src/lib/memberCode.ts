import type { DameProfile } from '@/integrations/dame-api/types';

const DOCUMENT_TYPE_MAP: Record<string, string> = {
  NIE: 'N',
  DNI: 'D',
  PASAPORTE: 'P',
};

/** Código escaneable (mismo formato que en /perfil). */
export function getMemberQrPayload(user: DameProfile | null | undefined): string | null {
  if (!user?.member?.document_number) return null;
  const docLetter = DOCUMENT_TYPE_MAP[user.member.document_type] ?? 'D';
  return `${user.id}-${docLetter}-${user.member.document_number}`;
}
