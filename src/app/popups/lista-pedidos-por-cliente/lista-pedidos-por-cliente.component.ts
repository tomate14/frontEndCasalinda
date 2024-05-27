import { Component, Input, LOCALE_ID } from '@angular/core';
import { Pedido } from '../../../clases/dominio/pedido';
import { CurrencyPipe, DatePipe, NgClass, NgFor } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ListarPagosPorPedidosService } from '../../../services/popup/listaPagosPorPedidos.service';
import { PedidosService } from '../../../services/pedidos.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import localeEsArExtra from '@angular/common/locales/extra/es-AR';

registerLocaleData(localeEsAr, 'es-AR', localeEsArExtra);

@Component({
  selector: 'app-lista-pedidos-por-cliente',
  standalone: true,
  imports: [NgFor, NgClass, NgxPaginationModule, DatePipe, CurrencyPipe ],
  providers: [{ provide: LOCALE_ID, useValue: 'es-AR' }],
  templateUrl: './lista-pedidos-por-cliente.component.html',
  styleUrl: './lista-pedidos-por-cliente.component.css'
})
export class ListaPedidosPorClienteComponent {

  @Input() pedidos: Pedido[] = [];
  @Input() title: string = "";
  @Input() dniCliente: number = 0;
  p: number = 1;
  constructor(private activeModal: NgbActiveModal, private pagosPorPedidosService: ListarPagosPorPedidosService, private pedidosService: PedidosService) {
    
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

  cerrar() {
    this.activeModal.close(false);
  }

}
