
export interface Pedido {
    _id?: {
      $oid: string;
    };
    numeroComprobante?:string
    fechaPedido?: string;
    total: number;
    estado: 'PENDIENTE' | 'COMPLETO';    
    tipoPedido: number;
    descripcion: string;
    estadoEnvio:number;
    conSena?:boolean;
    nombreCliente?:string; 
    dniCliente?: number;
    telefonoCliente?:string;
  }