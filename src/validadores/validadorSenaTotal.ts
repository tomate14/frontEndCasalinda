import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function senaMenorQueTotalValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const sena = control.get('seña')?.value;
    const total = control.get('total')?.value;

    return sena !== null && total !== null && sena > total ? { 'senaMayorQueTotal': true } : null;
  };
}
