import { Injectable } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Producto } from '../../clases/dominio/producto';
import { VerImagenesProductoComponent } from '../../app/popups/ver-imagenes-producto/ver-imagenes-producto.component';

@Injectable({
  providedIn: 'root'
})
export class VerImagenesProductoService {

  constructor(private modalService: NgbModal) { }

  public abrirImagenesProducto(producto: Producto): Promise<any> {
    const modalOptions: NgbModalOptions = {
      size: 'lg'
    };
    const modalRef = this.modalService.open(VerImagenesProductoComponent, modalOptions);
    modalRef.componentInstance.producto = producto;
    return modalRef.result;
  }
}
