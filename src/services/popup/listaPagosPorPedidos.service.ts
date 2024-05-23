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
  public crearListaPagos( idPedido: string, totalPedido:number): Promise<boolean> {    
    const modalOptions: NgbModalOptions = {
      size: 'lg' // Establecer el tamaño del modal como grande (100% de la pantalla vertical)
    };

    const modalRef = this.modalService.open(ListaPagosPorPedidoComponent, modalOptions);
    modalRef.componentInstance.title = "Lista de pagos del pedido "+idPedido;
    modalRef.componentInstance.idPedido = idPedido;
    modalRef.componentInstance.totalPedido = totalPedido;
    return modalRef.result;
  }
}