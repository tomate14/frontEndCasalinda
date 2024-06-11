import { Injectable } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Pedido } from '../../clases/dominio/pedido';
import { EditarPedidoComponent } from '../../app/popups/editar-pedido/editar-pedido.component';

@Injectable({
  providedIn: 'root'
})
export class EditarPedidoService {

    constructor(private modalService: NgbModal) { }
  
    //Popup de confirmacion
    public editarPedido(pedido:Pedido | undefined ): Promise<any> {   
      const modalOptions: NgbModalOptions = {
          size: 'lg' // Establecer el tamaño del modal como grande (100% de la pantalla vertical)
        }; 
      const modalRef = this.modalService.open(EditarPedidoComponent, modalOptions);
      modalRef.componentInstance.title = "Editar pedido";
      if (pedido) {
        modalRef.componentInstance.pedido = pedido;
      }
  
      return modalRef.result;
    }
  }