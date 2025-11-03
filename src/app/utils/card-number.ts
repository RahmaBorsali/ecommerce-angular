import { AbstractControl, ValidationErrors } from '@angular/forms';
import { luhnCheck, sanitizeCardNumber } from './card';

export function cardNumber(control: AbstractControl): ValidationErrors | null {
  const v = (control.value || '').toString();
  const clean = sanitizeCardNumber(v);

  // accepte 13 à 19 chiffres, puis vérifie Luhn
  if (!/^\d{13,19}$/.test(clean)) return { cardFormat: true };
  if (!luhnCheck(clean)) return { cardLuhn: true };
  return null;
}
