import { Component, Input } from '@angular/core';
import { Pedido } from '../../../clases/dominio/pedido';
import { CurrencyPipe, DatePipe, NgClass, NgFor } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ListarPagosPorPedidosService } from '../../../services/popup/listaPagosPorPedidos.service';
import { PedidosService } from '../../../services/pedidos.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { MostrarImagenService } from '../../../services/popup/mostrarimagen.service';

@Component({
  selector: 'app-lista-pedidos-por-cliente',
  standalone: true,
  imports: [NgFor, NgClass, NgxPaginationModule, DatePipe, CurrencyPipe ],
  templateUrl: './lista-pedidos-por-cliente.component.html',
  styleUrl: './lista-pedidos-por-cliente.component.css'
})
export class ListaPedidosPorClienteComponent {

  @Input() pedidos: Pedido[] = [];
  @Input() title: string = "";
  @Input() dniCliente: number = 0;
  p: number = 1;
  constructor(private activeModal: NgbActiveModal, private pagosPorPedidosService: ListarPagosPorPedidosService, private pedidosService: PedidosService, private imagenService:MostrarImagenService) {
    
  }

  ngOnInit(): void {

  }

  verPagos(pedido: Pedido): void {
    const pedidoId = pedido._id as unknown as string;
    const totalPedido = pedido.total;
    this.pagosPorPedidosService.crearListaPagos(pedidoId, totalPedido).then((res)=> {
      this.pedidosService.getByDniCliente(this.dniCliente).subscribe((res)=>{
        this.pedidos = res;
      })
    });
    
  }
  verImagen(pedido:Pedido):void {
    this.imagenService.crearMostrarImagenPopup(pedido).then((res)=> {
      console.log("asd");
    });
  }

  cerrar() {
    this.activeModal.close(false);
  }

}
