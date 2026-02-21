import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DateTime } from 'luxon';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { Pago } from '../../../../clases/dominio/pago';
import { PagosService } from '../../../../services/pago.service';
import { formatDateToDayMonth, formatearFechaDesdeUnIso, getPreviousDays, horaPrincipioFinDia, nowConLuxonATimezoneArgentina } from '../../../../utils/dates';
import { coloresGrafico } from '../../../../utils/color-graficos';

const defaultFormObject = {
    fechaDesde: formatearFechaDesdeUnIso(getPreviousDays(nowConLuxonATimezoneArgentina(),false,30), 'yyyy-MM-dd'),
    fechaHasta: formatearFechaDesdeUnIso(horaPrincipioFinDia(nowConLuxonATimezoneArgentina(), true), 'yyyy-MM-dd'),
};

@Component({
  selector: 'app-grafico-resumen-barra-ultimos-dias',
  standalone: true,
  imports: [NgxChartsModule, ReactiveFormsModule, FormsModule],
  templateUrl: './grafico-resumen-barra-ultimos-dias.component.html',
  styleUrl: './grafico-resumen-barra-ultimos-dias.component.css'
})
export class GraficoResumenBarraUltimosDiasComponent implements OnInit {

  fechasBarrasForm: FormGroup;
  tendenciaOperativa: any[] = [];
  totalesRango = { cobrado: 0, egresos: 0, neto: 0 };
  cargando: boolean = false;

  colorScheme: Color = {
    name: 'tendenciaOperativa',
    selectable: false,
    group: ScaleType.Ordinal,
    domain: [coloresGrafico.contado, coloresGrafico.gastos, coloresGrafico.ganancia]
  };

  constructor(private fb: FormBuilder, private pagosService: PagosService) {
    this.fechasBarrasForm = this.fb.group({
      fechaDesde: [defaultFormObject.fechaDesde, Validators.required],
      fechaHasta: [defaultFormObject.fechaHasta, Validators.required]
    });
  }

  ngOnInit(): void {
    this.onSubmitForm();
  }

  onSubmitForm(): void {
    if (this.fechasBarrasForm.valid) {
      const fechaDesde = horaPrincipioFinDia(this.fechasBarrasForm.value.fechaDesde, false);
      const fechaHasta = horaPrincipioFinDia(this.fechasBarrasForm.value.fechaHasta, true);
      this.cargarTendencia(fechaDesde, fechaHasta);
    }
  }
 
  private cargarTendencia(fechaDesde:string, fechaHasta:string): void {
    this.cargando = true;
    this.pagosService.getCajaByDate(fechaDesde, fechaHasta).subscribe({
      next: (pagos: Pago[]) => {
        const resumenPorDia = new Map<string, { cobrado: number; egresos: number; neto: number }>();

        pagos.forEach((pago: Pago) => {
          if (!this.esPagoOperativo(pago)) {
            return;
          }

          const clave = DateTime.fromISO(pago.fechaPago, { zone: 'America/Argentina/Buenos_Aires' }).toFormat('yyyy-MM-dd');
          const actual = resumenPorDia.get(clave) ?? { cobrado: 0, egresos: 0, neto: 0 };

          if (pago.valor > 0) {
            actual.cobrado += pago.valor;
          } else if (pago.valor < 0) {
            actual.egresos += Math.abs(pago.valor);
          }

          actual.neto = actual.cobrado - actual.egresos;
          resumenPorDia.set(clave, actual);
        });

        const fechasOrdenadas = [...resumenPorDia.keys()].sort((a: string, b: string) => a.localeCompare(b));
        const cobradoSerie: { name: string; value: number }[] = [];
        const egresosSerie: { name: string; value: number }[] = [];
        const netoSerie: { name: string; value: number }[] = [];

        this.totalesRango = { cobrado: 0, egresos: 0, neto: 0 };

        fechasOrdenadas.forEach((fecha: string) => {
          const resumen = resumenPorDia.get(fecha);
          if (!resumen) {
            return;
          }

          const etiquetaFecha = formatDateToDayMonth(fecha);

          cobradoSerie.push({ name: etiquetaFecha, value: resumen.cobrado });
          egresosSerie.push({ name: etiquetaFecha, value: resumen.egresos });
          netoSerie.push({ name: etiquetaFecha, value: resumen.neto });

          this.totalesRango.cobrado += resumen.cobrado;
          this.totalesRango.egresos += resumen.egresos;
          this.totalesRango.neto += resumen.neto;
        });

        this.tendenciaOperativa = [
          { name: 'Cobrado', series: cobradoSerie },
          { name: 'Egresos', series: egresosSerie },
          { name: 'Neto', series: netoSerie }
        ];

        this.cargando = false;
      },
      error: () => {
        this.tendenciaOperativa = [];
        this.totalesRango = { cobrado: 0, egresos: 0, neto: 0 };
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

  formatMoneda(value: number): string {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);
  }

  formatYTicks = (value: number): string => this.formatMoneda(value);
}
