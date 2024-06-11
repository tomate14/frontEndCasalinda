import { Injectable } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { CrearClienteComponent } from '../../app/popups/crear-cliente/crear-cliente.component';
import { Cliente } from '../../clases/dominio/cliente';
import { Pago } from '../../clases/dominio/pago';
import { ListaCajaPasadaComponent } from '../../app/popups/lista-caja-pasada/lista-caja-pasada.component';

@Injectable({
  providedIn: 'root'
})
export class ListaCajaPasadaService {

  constructor(private modalService: NgbModal) { }

  //Popup de confirmacion
  public mostrarPagosPasados(pagos:Pago[] | undefined, ingresosRetiros:Pago[] | undefined ): Promise<any> {    
    const modalOptions: NgbModalOptions = {
        size: 'xl' // Establecer el tamaño del modal como grande (100% de la pantalla vertical)
    };
    const modalRef = this.modalService.open(ListaCajaPasadaComponent, modalOptions);

    if (pagos && ingresosRetiros) {
        modalRef.componentInstance.pagos = pagos;
        modalRef.componentInstance.ingresosRetiros = ingresosRetiros;
    }

    return modalRef.result;
  }
}