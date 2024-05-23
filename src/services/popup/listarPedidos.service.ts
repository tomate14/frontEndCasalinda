import { Injectable } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ListaPedidosPorClienteComponent } from '../../app/popups/lista-pedidos-por-cliente/lista-pedidos-por-cliente.component';
import { Pedido } from '../../clases/dominio/pedido';

@Injectable({
  providedIn: 'root'
})
export class ListarPedidosService {

  constructor(private modalService: NgbModal) { }

  //Popup de confirmacion
  public crearLista( dni: number, pedidos: Pedido[]): Promise<boolean> {    
    const modalOptions: NgbModalOptions = {
      size: 'xl' // Establecer el tamaño del modal como grande (100% de la pantalla vertical)
    };

    const modalRef = this.modalService.open(ListaPedidosPorClienteComponent, modalOptions);
    modalRef.componentInstance.title = "Lista de pedidos de "+dni;
    modalRef.componentInstance.pedidos = pedidos;
    modalRef.componentInstance.dniCliente = dni;

    return modalRef.result;
  }
}