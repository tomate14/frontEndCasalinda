import { Injectable } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Pedido } from '../../clases/dominio/pedido';
import { ListaPagosPorPedidoComponent } from '../../app/popups/lista-pagos-por-pedido/lista-pagos-por-pedido.component';

@Injectable({
  providedIn: 'root'
})
export class ListarPagosPorPedidosService {

  constructor(private modalService: NgbModal) { }

  //Popup de confirmacion
  public crearListaPagos( pedido: Pedido, totalPedido:number): Promise<Pedido> {    
    const modalOptions: NgbModalOptions = {
      size: 'xl' // Establecer el tamaño del modal como grande (100% de la pantalla vertical)
    };

    const modalRef = this.modalService.open(ListaPagosPorPedidoComponent, modalOptions);
    modalRef.componentInstance.title = "Lista de pagos del pedido "+pedido.numeroComprobante;
    modalRef.componentInstance.pedido = pedido;
    modalRef.componentInstance.totalPedido = totalPedido;
    return modalRef.result;
  }
}