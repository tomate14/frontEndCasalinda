import { AbstractControl, ValidatorFn } from '@angular/forms';

export function maxLengthValidator(maxLength: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const isValid = control.value ? control.value.toString().length <= maxLength : true;
    return isValid ? null : { 'maxLength': { value: control.value } };
  };
}
