import { Injectable } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { GenerarComponent } from '../../app/popups/generar-pedido/generar.component';
import { Pedido } from '../../clases/dominio/pedido';
import { GenerarComprobanteComponent } from '../../app/popups/generar-comprobante/generar-comprobante.component';

@Injectable({
  providedIn: 'root'
})
export class CrearPedidoService {

  constructor(private modalService: NgbModal) { }

  //Popup de confirmacion
  public crearPedido(tipoComprobante:string, readonly:boolean, pedido:any): Promise<any> {    
    const modalOptions: NgbModalOptions = {
      size: 'xl' // Establecer el tamaño del modal como grande (100% de la pantalla vertical)
    };

    let comprobante = null;
    let title = "Generar Pedido";

    if (tipoComprobante === 'ORC' || tipoComprobante === 'ORV' || tipoComprobante === 'NDC') {
      comprobante = GenerarComprobanteComponent;
      title = "Generar "+tipoComprobante;
    } else {
      comprobante = GenerarComponent;
    }
    const modalRef = this.modalService.open(comprobante, modalOptions);

    modalRef.componentInstance.title = title;
    modalRef.componentInstance.tipoComprobante = tipoComprobante;
    modalRef.componentInstance.readonly = readonly;
    modalRef.componentInstance.pedido = pedido;
    return modalRef.result;
  }
}