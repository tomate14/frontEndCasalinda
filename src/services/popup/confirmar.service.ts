import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CrearClienteComponent } from '../../app/popups/crear-cliente/crear-cliente.component';
import { Cliente } from '../../clases/dominio/cliente';

@Injectable({
  providedIn: 'root'
})
export class CrearClienteService {

  constructor(private modalService: NgbModal) { }

  //Popup de confirmacion
  public crearCliente(cliente:Cliente | undefined ): Promise<any> {    
    const modalRef = this.modalService.open(CrearClienteComponent);
    modalRef.componentInstance.title = "Alta Cliente";
    if (cliente) {
      modalRef.componentInstance.cliente = cliente;
    }

    return modalRef.result;
  }
}