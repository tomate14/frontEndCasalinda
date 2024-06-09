export interface FormaDePago {
    value: number;
    viewValue: string;
}

export const formaDePago = [
  {value: 1, viewValue: 'Contado'},
  {value: 3, viewValue: 'Cuenta DNI'},
  {value: 2, viewValue: 'Tarjeta'},
  {value: 4, viewValue: 'Transferencia'},
];