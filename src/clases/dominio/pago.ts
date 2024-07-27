export interface Pago {
    id?:string;
    idPedido?: string;
    fechaPago: string;
    valor: number;
    formaPago?: number;
    descripcion?: string;
  }