import { Injectable } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { NotaCreditoPendiente } from '../../clases/dto/notaCreditoPendiente';
import { ListaNotasCreditoPendientesComponent } from '../../app/popups/lista-notas-credito-pendientes/lista-notas-credito-pendientes.component';

@Injectable({
  providedIn: 'root'
})
export class SeleccionarNotasCreditoService {
  constructor(private modalService: NgbModal) {}

  public seleccionarNotasCredito(notasCredito: NotaCreditoPendiente[]): Promise<NotaCreditoPendiente[] | null> {
    const modalOptions: NgbModalOptions = {
      size: 'xl'
    };

    const modalRef = this.modalService.open(ListaNotasCreditoPendientesComponent, modalOptions);
    modalRef.componentInstance.title = 'Aplicar notas de credito';
    modalRef.componentInstance.notasCredito = notasCredito;

    return modalRef.result;
  }
}
