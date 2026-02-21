import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Pago } from '../../../../clases/dominio/pago';
import { PagosService } from '../../../../services/pago.service';
import { formatearFechaDesdeUnIso, getPreviousDays, horaPrincipioFinDia, nowConLuxonATimezoneArgentina } from '../../../../utils/dates';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { coloresGrafico } from '../../../../utils/color-graficos';

type ModoVisualizacionMix = 'monto' | 'porcentaje';

@Component({
  selector: 'app-grafico-histograma',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgxChartsModule],
  templateUrl: './grafico-histograma.component.html',
  styleUrl: './grafico-histograma.component.css'
})
export class GraficoHistogramaComponent implements OnInit {
  mixData: { name: string; value: number }[] = [];
  detalleMix: { forma: string; monto: number; porcentaje: number }[] = [];
  totalCobrado: number = 0;
  modoVisualizacion: ModoVisualizacionMix = 'porcentaje';
  cargando: boolean = false;
  myForm: FormGroup;

  colorHistograma: Color = {
    name: 'mixCobros',
    selectable: false,
    group: ScaleType.Ordinal,
    domain: [coloresGrafico.contado, coloresGrafico.cuentaDni, coloresGrafico.tarjeta, coloresGrafico.transferencia]
  };

  constructor(private fb: FormBuilder, private pagosService: PagosService) {
    const fechaFin = horaPrincipioFinDia(nowConLuxonATimezoneArgentina(), true);
    const fechaInicio2 = getPreviousDays(nowConLuxonATimezoneArgentina(), false, 30);
    this.myForm = this.fb.group({
      fechaDesde: [formatearFechaDesdeUnIso(fechaInicio2, 'yyyy-MM-dd'), Validators.required],
      fechaHasta: [formatearFechaDesdeUnIso(fechaFin, 'yyyy-MM-dd'), Validators.required],
      modo: ['porcentaje', Validators.required]
    });
  }

  ngOnInit(): void {
    this.onSubmitForm();
  }
  
  onSubmitForm(): void {
    if (this.myForm.valid) {
      const fechaDesde = horaPrincipioFinDia(this.myForm.value.fechaDesde, false);
      const fechaHasta = horaPrincipioFinDia(this.myForm.value.fechaHasta, true);
      this.modoVisualizacion = this.myForm.value.modo as ModoVisualizacionMix;
      this.cargarMixCobros(fechaDesde, fechaHasta);
    }
  }

  onChangeModo(): void {
    this.modoVisualizacion = this.myForm.value.modo as ModoVisualizacionMix;
    this.actualizarGrafico();
  }

  private cargarMixCobros(fechaDesde: string, fechaHasta: string): void {
    this.cargando = true;
    this.pagosService.getCajaByDate(fechaDesde, fechaHasta).subscribe({
      next: (pagos: Pago[]) => {
        const totales = {
          contado: 0,
          cuentaDni: 0,
          tarjeta: 0,
          transferencia: 0
        };

        pagos.forEach((pago: Pago) => {
          if (!this.esPagoOperativo(pago) || pago.valor <= 0) {
            return;
          }

          if (pago.formaPago === 1) {
            totales.contado += pago.valor;
          } else if (pago.formaPago === 2) {
            totales.tarjeta += pago.valor;
          } else if (pago.formaPago === 3) {
            totales.cuentaDni += pago.valor;
          } else if (pago.formaPago === 4) {
            totales.transferencia += pago.valor;
          }
        });

        this.totalCobrado = totales.contado + totales.cuentaDni + totales.tarjeta + totales.transferencia;

        this.detalleMix = [
          { forma: 'Contado', monto: totales.contado, porcentaje: this.calcularPorcentaje(totales.contado) },
          { forma: 'Cuenta DNI', monto: totales.cuentaDni, porcentaje: this.calcularPorcentaje(totales.cuentaDni) },
          { forma: 'Tarjeta', monto: totales.tarjeta, porcentaje: this.calcularPorcentaje(totales.tarjeta) },
          { forma: 'Transferencia', monto: totales.transferencia, porcentaje: this.calcularPorcentaje(totales.transferencia) }
        ];

        this.actualizarGrafico();
        this.cargando = false;
      },
      error: () => {
        this.totalCobrado = 0;
        this.detalleMix = [];
        this.mixData = [];
        this.cargando = false;
      }
    });
  }

  private esPagoOperativo(pago: Pago): boolean {
    if (pago.idPedido === -2 || pago.idPedido === -3) {
      return false;
    }
    return this.esFormaPagoValida(pago.formaPago);
  }

  private esFormaPagoValida(formaPago?: number): boolean {
    return formaPago === 1 || formaPago === 2 || formaPago === 3 || formaPago === 4;
  }

  private actualizarGrafico(): void {
    this.mixData = this.detalleMix.map((item) => ({
      name: item.forma,
      value: this.modoVisualizacion === 'porcentaje' ? Number(item.porcentaje.toFixed(2)) : item.monto
    }));
  }

  private calcularPorcentaje(monto: number): number {
    if (this.totalCobrado === 0) {
      return 0;
    }
    return (monto * 100) / this.totalCobrado;
  }

  formatMoneda(value: number): string {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);
  }

  formatPorcentaje(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  formatValorGrafico = (value: number): string =>
    this.modoVisualizacion === 'porcentaje' ? this.formatPorcentaje(value) : this.formatMoneda(value);
}
