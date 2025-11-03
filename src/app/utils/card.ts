export function sanitizeCardNumber(input: string) {
  return (input || '').replace(/\s+/g, '');
}

export function luhnCheck(cardNumber: string): boolean {
  const s = sanitizeCardNumber(cardNumber);
  if (!/^\d{13,19}$/.test(s)) return false; // longueur plausible
  let sum = 0;
  let shouldDouble = false;
  // parcours de droite à gauche
  for (let i = s.length - 1; i >= 0; i--) {
    let digit = parseInt(s.charAt(i), 10);
    if (shouldDouble) {
      digit = digit * 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

