import { Component, OnInit } from '@angular/core';
import { PedidosService } from '../../../services/pedidos.service';
import { DatePipe, NgFor, NgIf, formatDate } from '@angular/common';
import { Pedido } from '../../../clases/dominio/pedido';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {provideNativeDateAdapter} from '@angular/material/core';
import {MatInputModule} from '@angular/material/input';
import { transformarAHoraArgentinaISO } from '../../../utils/dates';
import { CrearPedidoService } from '../../../services/popup/generar-pedidos.service';

const defaultFormObject = {
  dniCliente: null,
  nombre: null,
  idPedido: null,
  fechaDesde: null,
  fechaHasta: null,
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
  constructor(private fb: FormBuilder, private pedidosService: PedidosService, private crearPedidoModal:CrearPedidoService) { 
    this.filterForm = this.fb.group({});
  }

  ngOnInit(): void {
    
    this.filterForm = this.fb.group(defaultFormObject);

    this.pedidosService.get().subscribe(
      (data: Pedido[]) => {
        this.pedidos = data;
      },
      (error) => {
        alert('Error al obtener los productos '+error);
      }
    );
  }
  buscar() {
    const { idPedido, dniCliente, nombre, fechaHasta, fechaDesde } = this.filterForm.value;
    const fechaDesdeDate = fechaDesde ? transformarAHoraArgentinaISO(fechaDesde) : null;
    const fechaHastaDate = fechaHasta ? transformarAHoraArgentinaISO(fechaHasta) : null;
    this.pedidos = this.pedidos.filter((pedido: Pedido) => {
      const matchesIdPedido = idPedido ? pedido._id === idPedido : true;
      const matchesDniCliente = dniCliente ? pedido.dniCliente === +dniCliente : true;
      const matchesNombre = nombre ? pedido.nombreCliente?.toLowerCase().includes(nombre.toLowerCase()) : true;
      const matchesFechaDesde = fechaDesdeDate ? transformarAHoraArgentinaISO(pedido.fechaPedido) >= fechaDesdeDate : true;
      const matchesFechaHasta = fechaHastaDate ? transformarAHoraArgentinaISO(pedido.fechaPedido) <= fechaHastaDate : true;

      return matchesIdPedido && matchesDniCliente && matchesNombre && matchesFechaDesde && matchesFechaHasta;
    });
  }
  limpiar() {
    this.filterForm.reset(defaultFormObject);
    this.pedidosService.get().subscribe(
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
      if(res.confirmed){

      }
    })
  }
}
