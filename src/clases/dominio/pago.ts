export interface Pago {
    id?:string;
    idPedido?: any;
    fechaPago: string;
    valor: number;
    formaPago?: number;
    descripcion?: string;
  }