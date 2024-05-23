export interface Pedido {
    _id?: {
      $oid: string;
    };
    dniCliente: number;
    fechaPedido: Date;
    total: number;
    estado: 'PENDIENTE' | 'COMPLETO';
    descripcion: string;
    imagen: string;
    nombreCliente?:string; 
  }