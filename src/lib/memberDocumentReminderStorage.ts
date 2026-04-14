/** Sesión: el usuario cerró el aviso de “falta documento” (vuelve a mostrarse tras nuevo login). */
const SESSION_KEY = "dame_member_doc_modal_session_dismissed";

export function clearMemberDocumentReminderDismissed(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function isMemberDocumentReminderDismissedForUser(userId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(SESSION_KEY) === userId;
  } catch {
    return false;
  }
}

export function setMemberDocumentReminderDismissedForUser(userId: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SESSION_KEY, userId);
  } catch {
    /* ignore */
  }
}
