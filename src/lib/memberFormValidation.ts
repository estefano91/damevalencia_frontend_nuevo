/**
 * Validación compartida alta de miembro (Membership / EditMember).
 */

export function validateMemberDocumentNumber(
  type: string,
  number: string,
  isEn: boolean
): string | null {
  const trimmed = number.trim().toUpperCase();

  if (!trimmed) {
    return isEn
      ? 'Document number is required'
      : 'El número de documento es obligatorio';
  }

  if (type === 'DNI') {
    const dniRegex = /^\d{8}[A-Z]$/;
    if (!dniRegex.test(trimmed)) {
      return isEn
        ? 'Invalid DNI format (8 digits + letter)'
        : 'Formato de DNI inválido (8 dígitos + letra)';
    }
  } else if (type === 'NIE') {
    const nieRegex = /^[XYZ]\d{7}[A-Z]$/;
    if (!nieRegex.test(trimmed)) {
      return isEn
        ? 'Invalid NIE format (X/Y/Z + 7 digits + letter)'
        : 'Formato de NIE inválido (X/Y/Z + 7 dígitos + letra)';
    }
  } else if (type === 'PASAPORTE') {
    if (trimmed.length < 6) {
      return isEn
        ? 'Passport must have at least 6 characters'
        : 'El pasaporte debe tener al menos 6 caracteres';
    }
  }

  return null;
}

export function validateMemberBirthDate(date: string, isEn: boolean): string | null {
  if (!date) {
    return isEn ? 'Birth date is required' : 'La fecha de nacimiento es requerida';
  }

  const birthDate = new Date(date);
  const today = new Date();

  if (birthDate > today) {
    return isEn
      ? 'Birth date cannot be in the future'
      : 'La fecha de nacimiento no puede ser futura';
  }

  const age = today.getFullYear() - birthDate.getFullYear();
  if (age > 150) {
    return isEn
      ? 'Please enter a valid birth date'
      : 'Por favor ingresa una fecha de nacimiento válida';
  }

  return null;
}
