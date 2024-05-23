export interface Pago {
    _id?: {
      $oid: string;
    };
    idPedido?: string;
    fechaPago: Date;
    valor: number;
  }