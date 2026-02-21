
export interface Pedido {
    id?:string;
    numeroComprobante?:string
    fechaPedido?: string;
    total: number;
    estado: 'PENDIENTE' | 'COMPLETO';    
    tipoPedido: number;
    descripcion: string;
    estadoEnvio:number;
    conSena?:boolean;
    imagenUrl?: string;
    nombreCliente?:string; 
    dniCliente?: number;
    telefonoCliente?:string;
  }
