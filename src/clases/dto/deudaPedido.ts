import { Pedido } from "../dominio/pedido";

export interface DeudaPedido {
    fechaUltimoPago?:string,
    montoUltimoPago?:number,
    nombreCliente:string,
    telefonoCliente:string,
    pedido:Pedido,
    saldoRestante:number
}
