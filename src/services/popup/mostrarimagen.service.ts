import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MostrarImagenPedidoComponent } from '../../app/popups/mostrar-imagen-pedido/mostrar-imagen-pedido.component';
import { Pedido } from '../../clases/dominio/pedido';

@Injectable({
  providedIn: 'root'
})
export class MostrarImagenService {

  constructor(private modalService: NgbModal) { }

  //Popup de confirmacion
  public crearMostrarImagenPopup(pedido:Pedido | undefined ): Promise<any> {    
    const modalRef = this.modalService.open(MostrarImagenPedidoComponent);
    if (pedido) {
        modalRef.componentInstance.title = "Imagen del pedido "+pedido?._id;
        modalRef.componentInstance.pedido = pedido;
    }

    return modalRef.result;
  }
}