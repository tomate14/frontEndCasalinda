import { DeudaPedido } from "../clases/dto/deudaPedido";
import { formatearFechaDesdeUnIso } from "./dates";

export function enviarMensajeAltaPedido(nombre:string, id:number, descripcion:string, entrega:number, saldo:number, telefono:string|undefined, numeroComprobante:string) {
    let body = `Hola ${nombre}. Confirmamos su pedido *_${numeroComprobante}_* con una fecha de entrega estimada de *_30 dias_* habiles aproximadamente.`;
    body = body + ` Aclaramos que el pedido puede sufrir atrasos por cuestiones de fuerza mayor (clima, demora de materiales, imprevistos de producción, etc).`;
    body = body + ` Asi mismo, tomamos como descripcion del producto: ${descripcion}.`;
    body = body + ` Se tomo una seña de *_$${entrega}_* y el saldo es de *_$${saldo}_*.`;
    body = body + ` *_No realizamos seguimiento del pedido_* ni contamos con envio propio, el flete tiene un costo adicional a consultar.`;
    body = body + ` Te avisaremos directamente cuando este listo para retirar o coordinar entrega.`;
    body = body + ` Agradecemos tu paciencia y comprensión. Muchas gracias.`;

    const phoneNumber = telefono;
    const encodedMessage = encodeURIComponent(body); // Codificar el mensaje para URL
    const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(url);
}
export function enviarMensajeAltaCC(nombre:string, id:number, descripcion:string, entrega:number, saldo:number, telefono:string|undefined, numeroComprobante:string) {
  let body = `Hola ${nombre}. Registramos un nuevo ingreso a su Cuenta Corriente con numero *_${numeroComprobante}_* en concepto de ${descripcion}.`;
  body = body + ` Se tomo una seña de *_$${entrega}_* y el saldo es de *_$${saldo}_*.`;

  const phoneNumber = telefono;
  const encodedMessage = encodeURIComponent(body); // Codificar el mensaje para URL
  const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  window.open(url);
}


export function notificarDeudaPedido(res:DeudaPedido) {
  const mensaje = res.tipoPedido === 1 ? 'Notificamos que el pedido' : 'Notificamos que la Cuenta Corriente numero'
    let body = `Hola ${res.nombreCliente}. ${mensaje} *_${res.numeroComprobante}_* adeuda pagos.`;
      if (res.fechaUltimoPago) {
        body = body + ` El ultimo pago registrado fue el *_${formatearFechaDesdeUnIso(res.fechaUltimoPago, 'dd/MM/yyyy HH:mm')}_* por un monto de *_$${res.montoUltimoPago}_*.`;
      }
      body = body + ` El saldo restante a abonar es *_$${res.saldoRestante}_*.`;
      body = body + ` Necesitamos que pase a abonarlo a la brevedad.`;
      body = body + ` Muchas gracias. \n`;
      body = body + `Casa Linda`;

      const encodedMessage = encodeURIComponent(body); // Codificar el mensaje para URL
      const url = `https://wa.me/${res.telefonoCliente}?text=${encodedMessage}`;
      window.open(url);
}
