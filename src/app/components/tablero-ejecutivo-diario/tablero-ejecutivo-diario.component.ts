import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DateTime } from 'luxon';
import { TableroEjecutivoDiario } from '../../../clases/dto/tableroEjecutivoDiario';
import { TableroEjecutivoService } from '../../../services/tablero-ejecutivo.service';

interface ExplicacionKpi {
  etiqueta: string;
  descripcion: string;
}

@Component({
  selector: 'app-tablero-ejecutivo-diario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tablero-ejecutivo-diario.component.html',
  styleUrl: './tablero-ejecutivo-diario.component.css'
})
export class TableroEjecutivoDiarioComponent implements OnInit {
  resumen: TableroEjecutivoDiario | null = null;
  cargando: boolean = false;
  error: string = '';
  ayudaVisible: boolean = false;
  fechaSeleccionada: string = DateTime.now()
    .setZone('America/Argentina/Buenos_Aires')
    .toFormat('yyyy-MM-dd');
  readonly explicacionesKpi: ExplicacionKpi[] = [
    { etiqueta: 'Cobrado del dia', descripcion: 'Es la plata que ingreso hoy por ventas o pagos de clientes.' },
    { etiqueta: 'Egresos del dia', descripcion: 'Es la plata que salio hoy por pagos o gastos.' },
    { etiqueta: 'Neto operativo', descripcion: 'Es lo cobrado menos lo gastado en el dia.' },
    { etiqueta: 'Neto total de caja', descripcion: 'Es el neto operativo sumando ingresos manuales de caja y restando retiros manuales.' },
    { etiqueta: 'Pedidos creados hoy', descripcion: 'Cantidad de pedidos nuevos que se cargaron hoy.' },
    { etiqueta: 'Pendientes totales', descripcion: 'Cantidad de pedidos que todavia no estan completados.' },
    { etiqueta: 'En produccion', descripcion: 'Pedidos que ya se estan fabricando o preparando.' },
    { etiqueta: 'Listos para entregar', descripcion: 'Pedidos terminados que pueden entregarse.' },
    { etiqueta: 'Deuda pendiente total', descripcion: 'Total que aun falta cobrar en pedidos pendientes.' },
    { etiqueta: 'Ingresos de caja manuales', descripcion: 'Entradas de dinero cargadas manualmente en caja.' },
    { etiqueta: 'Retiros de caja manuales', descripcion: 'Salidas de dinero cargadas manualmente en caja.' },
    { etiqueta: 'Cantidad de cobros', descripcion: 'Cantidad de pagos cobrados durante el dia.' },
    { etiqueta: 'Ticket promedio', descripcion: 'Promedio de cada cobro del dia.' },
    { etiqueta: 'Cobros por forma de pago', descripcion: 'Muestra como se repartio lo cobrado entre contado, tarjeta, cuenta DNI y transferencia.' }
  ];

  constructor(private tableroEjecutivoService: TableroEjecutivoService) { }

  ngOnInit(): void {
    this.buscar();
  }

  buscar(): void {
    if (!this.fechaSeleccionada) {
      return;
    }

    this.cargando = true;
    this.error = '';

    this.tableroEjecutivoService.getResumenDiario(this.fechaSeleccionada).subscribe({
      next: (resumen: TableroEjecutivoDiario) => {
        this.resumen = resumen;
        this.cargando = false;
      },
      error: (errorResponse: { error?: { message?: string } }) => {
        this.resumen = null;
        this.cargando = false;
        this.error = errorResponse?.error?.message ?? 'No se pudo cargar el tablero ejecutivo diario';
      }
    });
  }

  formatFecha(fecha: string): string {
    const parsed = DateTime.fromISO(fecha, { zone: 'America/Argentina/Buenos_Aires' });
    return parsed.isValid ? parsed.toFormat('dd/MM/yyyy') : fecha;
  }

  formatMoneda(valor: number): string {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(valor);
  }

  toggleAyuda(): void {
    this.ayudaVisible = !this.ayudaVisible;
  }
}
