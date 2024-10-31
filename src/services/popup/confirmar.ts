import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmarComponent } from '../../app/popups/confirmar/confirmar.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmarService {

  constructor(private modalService: NgbModal) { }

 //Popup de confirmacion
 public confirm( titulo: string, mensaje: string, omitirCancelar:boolean, labelOk:string, labelCancel:string): Promise<boolean> {    
  const modalRef = this.modalService.open(ConfirmarComponent);
  modalRef.componentInstance.title = titulo;
  modalRef.componentInstance.message = mensaje;
  modalRef.componentInstance.btnOkText = labelOk;
  if (!omitirCancelar) {
      modalRef.componentInstance.btnCancelText = labelCancel;
  }

  return modalRef.result;
}
}