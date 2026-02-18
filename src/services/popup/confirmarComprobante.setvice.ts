import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmarComprobanteComponent } from '../../app/popups/confirmar-comprobante/confirmar-comprobante.component';
import { FormaDePago } from '../../clases/constantes/formaPago';

@Injectable({
  providedIn: 'root'
})
export class ConfirmarComprobanteService {

  constructor(private modalService: NgbModal) { }

  public confirm(total: number, tipoComprobante: string, formaDePago: FormaDePago[], solicitarMonto = false): Promise<any> {
    const modalRef = this.modalService.open(ConfirmarComprobanteComponent);
    modalRef.componentInstance.tipoComprobante = tipoComprobante;
    modalRef.componentInstance.total = total;
    modalRef.componentInstance.formaDePago = formaDePago;
    modalRef.componentInstance.solicitarMonto = solicitarMonto;

    return modalRef.result;
  }
}
