import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmarComponent } from '../../app/popups/confirmar/confirmar.component';
import { ConfirmarComprobanteComponent } from '../../app/popups/confirmar-comprobante/confirmar-comprobante.component';
import { FormaDePago } from '../../clases/constantes/formaPago';

@Injectable({
  providedIn: 'root'
})
export class ConfirmarComprobanteService {

  constructor(private modalService: NgbModal) { }

  //Popup de confirmacion
  public confirm( total:number, tipoComprobante:string, formaDePago:FormaDePago[]): Promise<any> {    
    const modalRef = this.modalService.open(ConfirmarComprobanteComponent);
    modalRef.componentInstance.tipoComprobante = tipoComprobante;
    modalRef.componentInstance.total = total;
    modalRef.componentInstance.formaDePago = formaDePago;

    return modalRef.result;
  }
}