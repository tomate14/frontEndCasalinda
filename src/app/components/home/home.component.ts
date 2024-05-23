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

const defaultFormObject = {
  dniCliente: null,
  nombre: null,
  fechaDesde: null,
  fechaHasta: null,
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ MatFormFieldModule, MatDatepickerModule, NgFor, NgIf, ReactiveFormsModule, FormsModule, NgxPaginationModule, DatePipe, MatInputModule],
  providers: [provideNativeDateAdapter()],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  pedidos: Pedido[] = [];
  filterForm: FormGroup;
  isCollapsed: boolean = true;
  p: number = 1;
  constructor(private fb: FormBuilder, private pedidosService: PedidosService) { 
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
    const { dniCliente, nombre, fechaHasta, fechaDesde } = this.filterForm.value;
    const fechaDesdeDate = fechaDesde ? new Date(fechaDesde) : null;
    const fechaHastaDate = fechaHasta ? new Date(fechaHasta) : null;
    this.pedidos = this.pedidos.filter((pedido: Pedido) => {
      const matchesDniCliente = dniCliente ? pedido.dniCliente === +dniCliente : true;
      const matchesNombre = nombre ? pedido.nombreCliente?.toLowerCase().includes(nombre.toLowerCase()) : true;
      const matchesFechaDesde = fechaDesdeDate ? new Date(pedido.fechaPedido) >= fechaDesdeDate : true;
      const matchesFechaHasta = fechaHastaDate ? new Date(pedido.fechaPedido) <= fechaHastaDate : true;

      return matchesDniCliente && matchesNombre && matchesFechaDesde && matchesFechaHasta;
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
}
