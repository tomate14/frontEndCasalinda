import { Injectable } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Pedido } from '../../clases/dominio/pedido';
import { ListaCuentasCorrientesPorClienteComponent } from '../../app/popups/lista-cuentas-corrientes-por-cliente/lista-cuentas-corrientes-por-cliente.component';

@Injectable({
  providedIn: 'root'
})
export class ListarCuentasCorrientesService {

  constructor(private modalService: NgbModal) { }

  public crearLista(dni: number, cuentasCorrientes: Pedido[]): Promise<boolean> {
    const modalOptions: NgbModalOptions = {
      size: 'xl'
    };

    const modalRef = this.modalService.open(ListaCuentasCorrientesPorClienteComponent, modalOptions);
    modalRef.componentInstance.title = 'Lista de cuentas corrientes de ' + dni;
    modalRef.componentInstance.cuentasCorrientes = cuentasCorrientes;

    return modalRef.result;
  }
}
