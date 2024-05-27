import { Injectable } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { GenerarComponent } from '../../app/popups/generar-pedido/generar.component';

@Injectable({
  providedIn: 'root'
})
export class CrearPedidoService {

  constructor(private modalService: NgbModal) { }

  //Popup de confirmacion
  public crearPedido(): Promise<any> {    
    const modalOptions: NgbModalOptions = {
      size: 'xl' // Establecer el tamaño del modal como grande (100% de la pantalla vertical)
    };
    const modalRef = this.modalService.open(GenerarComponent, modalOptions);

    modalRef.componentInstance.title = "Generar Pedido ";

    return modalRef.result;
  }
}