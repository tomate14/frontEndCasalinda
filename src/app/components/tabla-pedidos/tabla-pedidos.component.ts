import { Component, Input, OnInit } from '@angular/core';
import { PedidosService } from '../../../services/pedidos.service';
import { DatePipe, NgFor, NgIf, formatDate } from '@angular/common';
import { Pedido } from '../../../clases/dominio/pedido';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {provideNativeDateAdapter} from '@angular/material/core';
import {MatInputModule} from '@angular/material/input';
import { getPreviousDays, nowConLuxonATimezoneArgentina, transformarAHoraArgentinaISO } from '../../../utils/dates';
import { CrearPedidoService } from '../../../services/popup/generar-pedidos.service';
import { TipoPedido, tipoDePedido } from '../../../clases/constantes/cuentaCorriente';
import { ActivatedRoute } from '@angular/router';
import { ListarPagosPorPedidosService } from '../../../services/popup/listaPagosPorPedidos.service';

const defaultFormObject = {
  dniCliente: null,
  nombre: null,
  idPedido: null,
  fechaDesde: null,
  fechaHasta: null,
  tipoDePedido:null,
  dias:0
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ MatFormFieldModule, MatDatepickerModule, NgFor, NgIf, ReactiveFormsModule, FormsModule, NgxPaginationModule, DatePipe, MatInputModule],
  providers: [provideNativeDateAdapter()],
  templateUrl: './tabla-pedidos.component.html',
  styleUrl: './tabla-pedidos.component.css'
})
export class TablaPedidoComponent implements OnInit {
  pedidos: Pedido[] = [];
  filterForm: FormGroup;
  isCollapsed: boolean = true;
  p: number = 1;
  tipoDePedido:TipoPedido[] = [];
  tipoPedido:number= 1;

  constructor(private route: ActivatedRoute, private fb: FormBuilder, private pedidosService: PedidosService, 
    private crearPedidoModal:CrearPedidoService, private pagosPorPedidosService: ListarPagosPorPedidosService) { 
    this.route.params.subscribe(params => {
      this.tipoPedido = +params['id']; // El + convierte el string a number
    });
    this.filterForm = this.fb.group({});
    this.tipoDePedido = tipoDePedido;
  }

  ngOnInit(): void {
    
    this.filterForm = this.fb.group(defaultFormObject);

    this.pedidosService.getPedidosPorTipo(this.tipoPedido).subscribe(
      (data: Pedido[]) => {
        this.pedidos = data;
      },
      (error) => {
        alert('Error al obtener los productos '+error);
      }
    );
  }
  buscar() {
    const { idPedido, dniCliente, nombre, fechaHasta, fechaDesde, tipoDePedido } = this.filterForm.value;
    const fechaDesdeDate = fechaDesde ? transformarAHoraArgentinaISO(fechaDesde.toISOString()) : null;
    const fechaHastaDate = fechaHasta ? transformarAHoraArgentinaISO(fechaHasta.toISOString()) : null;
    this.pedidos = this.pedidos.filter((pedido: Pedido) => {
      const matchesIdPedido = idPedido ? pedido._id === idPedido : true;
      const matchesDniCliente = dniCliente ? pedido.dniCliente === +dniCliente : true;
      const matchesNombre = nombre ? pedido.nombreCliente?.toLowerCase().includes(nombre.toLowerCase()) : true;
      const matchesFechaDesde = fechaDesdeDate ? transformarAHoraArgentinaISO(pedido.fechaPedido) >= fechaDesdeDate : true;
      const matchesFechaHasta = fechaHastaDate ? transformarAHoraArgentinaISO(pedido.fechaPedido) <= fechaHastaDate : true;
      const matchesEsPedido = +tipoDePedido === 1 ? pedido.tipoPedido === 1 : true;
      const matchesEsCuentaCorriente = +tipoDePedido === 2 ? pedido.tipoPedido === 2 : true;

      return matchesIdPedido && matchesDniCliente && matchesNombre && matchesFechaDesde && matchesFechaHasta && matchesEsPedido && matchesEsCuentaCorriente;
    });
  }
  limpiar() {
    this.filterForm.reset(defaultFormObject);
    this.pedidosService.getPedidosPorTipo(this.tipoPedido).subscribe(
      (data: Pedido[]) => {
        this.pedidos = data;
      },
      (error) => {
        alert('Error al obtener los productos '+error);
      }
    );
  }

  crearPedido() {
    this.crearPedidoModal.crearPedido().then((res)=> {
      if(res){
        this.pedidos.push(res);
      }
    })
  }

  filtrarDeudores() {
    const { dias } = this.filterForm.value;
    const fechaDesde = getPreviousDays(nowConLuxonATimezoneArgentina(),true,dias);
    this.pedidosService.getPedidosVencidos(fechaDesde, this.tipoPedido).subscribe((res) => {
      this.pedidos = res;
      this.filterForm.reset();
      this.isCollapsed = true;
    })
  }

  verPagos(pedido: Pedido): void {
    const pedidoId = pedido._id as unknown as string;
    const totalPedido = pedido.total;
    this.pagosPorPedidosService.crearListaPagos(pedidoId, totalPedido);   
  }
}
