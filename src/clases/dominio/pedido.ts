export interface Pedido {
    _id?: {
      $oid: string;
    };
    dniCliente: number;
    fechaPedido: string;
    total: number;
    estado: 'PENDIENTE' | 'COMPLETO';    
    tipoPedido: number;
    descripcion: string;
    nombreCliente?:string; 
  }