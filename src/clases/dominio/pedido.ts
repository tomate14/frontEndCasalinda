export interface Pedido {
    _id?: {
      $oid: string;
    };
    dniCliente: number;
    fechaPedido: string;
    total: number;
    estado: 'PENDIENTE' | 'COMPLETO';
    descripcion: string;
    nombreCliente?:string; 
  }