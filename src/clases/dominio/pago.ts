export interface Pago {
    _id?: {
      $oid: string;
    };
    idPedido?: string;
    fechaPago: string;
    valor: number;
    formaPago?: number;
    descripcion?: string;
  }