export interface FormaDePago {
    value: string;
    viewValue: string;
}

export const formaDePago = [
  {value: '1', viewValue: 'Contado'},
  {value: '2', viewValue: 'Tarjeta'},
  {value: '3', viewValue: 'Cuenta DNI'},
];