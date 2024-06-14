import { Pago } from "../dominio/pago";

export interface PagosPorPedido {
    pagos?: Pago[];
    nombreCliente:string,
    telefonoCliente:string,
    emailCliente:string
  }