import { Pedido } from "../dominio/pedido";

export interface DeudaPedido {
    nombreCliente:string,
    telefonoCliente:string,
    emailCliente:string,
    saldoRestante:number
    fechaUltimoPago?:string,
    montoUltimoPago?:number,
    numeroComprobante:string,
    tipoPedido: number
}
