import { Injectable } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Pago } from '../../clases/dominio/pago';
import { EditarPagoComponent } from '../../app/popups/editar-pago/editar-pedido.component';

@Injectable({
  providedIn: 'root'
})
export class EditarPagoService {

  constructor(private modalService: NgbModal) { }

  //Popup de confirmacion
  public editarPago(pago:Pago | undefined ): Promise<any> {   
    const modalOptions: NgbModalOptions = {
        size: 'lg' // Establecer el tamaño del modal como grande (100% de la pantalla vertical)
      }; 
    const modalRef = this.modalService.open(EditarPagoComponent, modalOptions);
    modalRef.componentInstance.title = "Editar pago";
    if (pago) {
      modalRef.componentInstance.pago = pago;
    }

    return modalRef.result;
  }
}