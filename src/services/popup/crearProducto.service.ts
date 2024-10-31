import { Injectable } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Producto } from '../../clases/dominio/producto';
import { EditarProductoComponent } from '../../app/popups/editar-producto/editar-producto.component';

@Injectable({
  providedIn: 'root'
})
export class CrearProductoService {

  constructor(private modalService: NgbModal) { }

  //Popup de confirmacion
  public abrirProducto(producto:Producto | undefined ): Promise<any> { 
    const modalOptions: NgbModalOptions = {
      size: 'lg' // Establecer el tamaño del modal como grande (100% de la pantalla vertical)
    };    
    const modalRef = this.modalService.open(EditarProductoComponent, modalOptions);
    modalRef.componentInstance.title = "Alta Producto";
    if (producto) {
        modalRef.componentInstance.title = "Editar Producto";
        modalRef.componentInstance.producto = producto;
    }

    return modalRef.result;
  }
}