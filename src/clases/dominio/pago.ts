export interface Pago {
    id?:number;
    idPedido?: number;
    fechaPago: string;
    valor: number;
    formaPago?: number;
    descripcion?: string;
  }
