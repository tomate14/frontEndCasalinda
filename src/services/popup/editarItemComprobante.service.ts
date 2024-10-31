import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EditarItemComprobanteComponent } from '../../app/popups/editar-item-comprobante/editar-item-comprobante.component';
import { Producto } from '../../clases/dominio/producto';

@Injectable({
  providedIn: 'root'
})
export class EditarItemComprobanteService {

  constructor(private modalService: NgbModal) { }

   //Popup de confirmacion
   public editarItem( producto: Producto): Promise<Producto> {    
    const modalRef = this.modalService.open(EditarItemComprobanteComponent);

    modalRef.componentInstance.producto = producto;    

    return modalRef.result;
  }
  
}