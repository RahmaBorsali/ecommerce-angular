import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function matchFieldsValidator(a: string, b: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const c1 = group.get(a);
    const c2 = group.get(b);
    if (!c1 || !c2) return null;
    return c1.value === c2.value ? null : { fieldsMismatch: true };
  };
}
