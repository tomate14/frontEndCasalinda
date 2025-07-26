import { Pago } from "../clases/dominio/pago"

export function esIngresoEgresoCaja(pago:Pago): boolean {
    return pago.idPedido !== -2 && pago.idPedido !== -3
}