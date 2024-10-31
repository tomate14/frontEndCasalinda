export interface TipoPedido {
    value: number;
    viewValue: string;
    sigla?: string;
}

export const tipoDePedido = [
  {value: 1, viewValue: 'Pedido', sigla: 'PED'},
  {value: 2, viewValue: 'Cuenta Corriente', sigla: 'CC' },
  {value: 3, viewValue: 'Orden de compra', sigla: 'ORC' },
  {value: 4, viewValue: 'Orden de venta', sigla: 'ORV' },
  {value: 5, viewValue: 'Nota de credito', sigla: 'NDC' }
];