import { Component, OnInit } from '@angular/core';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { DateTime } from 'luxon';
import { Pago } from '../../../../clases/dominio/pago';
import { PagosService } from '../../../../services/pago.service';
import { getPreviousDays, horaPrincipioFinDia, nowConLuxonATimezoneArgentina } from '../../../../utils/dates';
import { formatearNumeros } from '../../../../utils/formato-numeros';

interface IndicadoresOperacion {
  cobrado: number;
  egresos: number;
  neto: number;
}

interface SerieComparativa {
  name: string;
  series: { name: string; value: number }[];
}

@Component({
  selector: 'app-grafico-resumen-ultimo-dia',
  standalone: true,
  imports: [NgxChartsModule],
  templateUrl: './grafico-resumen-ultimo-dia.component.html',
  styleUrl: './grafico-resumen-ultimo-dia.component.css'
})
export class GraficoResumenUltimoDiaComponent implements OnInit {
  comparativo: SerieComparativa[] = [];
  resumenHoy: IndicadoresOperacion = this.crearIndicadoresVacios();
  resumenAyer: IndicadoresOperacion = this.crearIndicadoresVacios();
  resumenPromedio7d: IndicadoresOperacion = this.crearIndicadoresVacios();
  cargando: boolean = false;

  colorScheme: Color = {
    name: 'comparativoScheme',
    selectable: false,
    group: ScaleType.Ordinal,
    domain: ['#1a75ff', '#60717f', '#00b300']
  };

  constructor(private pagosService: PagosService) {}

  ngOnInit(): void {
    this.cargarComparativoOperativo();
  }

  private cargarComparativoOperativo(): void {
    const ahoraIso = nowConLuxonATimezoneArgentina();
    const fechaDesde = getPreviousDays(ahoraIso, false, 8);
    const fechaHasta = horaPrincipioFinDia(ahoraIso, true);
    const hoy = DateTime.fromISO(ahoraIso, { zone: 'America/Argentina/Buenos_Aires' });
    const claveHoy = hoy.toFormat('yyyy-MM-dd');
    const claveAyer = hoy.minus({ days: 1 }).toFormat('yyyy-MM-dd');

    this.cargando = true;
    this.pagosService.getCajaByDate(fechaDesde, fechaHasta).subscribe({
      next: (pagos: Pago[]) => {
        const mapa = this.mapearPorDia(pagos);
        this.resumenHoy = mapa.get(claveHoy) ?? this.crearIndicadoresVacios();
        this.resumenAyer = mapa.get(claveAyer) ?? this.crearIndicadoresVacios();
        this.resumenPromedio7d = this.calcularPromedio7Dias(mapa, hoy);
        this.comparativo = this.armarSeriesComparativas();
        this.cargando = false;
      },
      error: () => {
        this.resumenHoy = this.crearIndicadoresVacios();
        this.resumenAyer = this.crearIndicadoresVacios();
        this.resumenPromedio7d = this.crearIndicadoresVacios();
        this.comparativo = this.armarSeriesComparativas();
        this.cargando = false;
      }
    });
  }

  private mapearPorDia(pagos: Pago[]): Map<string, IndicadoresOperacion> {
    const mapa = new Map<string, IndicadoresOperacion>();

    pagos.forEach((pago: Pago) => {
      if (!this.esPagoOperativo(pago)) {
        return;
      }

      const clave = DateTime.fromISO(pago.fechaPago, { zone: 'America/Argentina/Buenos_Aires' }).toFormat('yyyy-MM-dd');
      const actual = mapa.get(clave) ?? this.crearIndicadoresVacios();
      if (pago.valor > 0) {
        actual.cobrado += pago.valor;
      } else if (pago.valor < 0) {
        actual.egresos += Math.abs(pago.valor);
      }
      actual.neto = actual.cobrado - actual.egresos;
      mapa.set(clave, actual);
    });

    return mapa;
  }

  private calcularPromedio7Dias(mapa: Map<string, IndicadoresOperacion>, fechaBase: DateTime): IndicadoresOperacion {
    const acumulado = this.crearIndicadoresVacios();
    const dias = 7;

    for (let i = 1; i <= dias; i++) {
      const clave = fechaBase.minus({ days: i }).toFormat('yyyy-MM-dd');
      const valorDia = mapa.get(clave) ?? this.crearIndicadoresVacios();
      acumulado.cobrado += valorDia.cobrado;
      acumulado.egresos += valorDia.egresos;
      acumulado.neto += valorDia.neto;
    }

    return {
      cobrado: acumulado.cobrado / dias,
      egresos: acumulado.egresos / dias,
      neto: acumulado.neto / dias
    };
  }

  private armarSeriesComparativas(): SerieComparativa[] {
    return [
      {
        name: 'Cobrado',
        series: [
          { name: 'Hoy', value: this.resumenHoy.cobrado },
          { name: 'Ayer', value: this.resumenAyer.cobrado },
          { name: 'Prom. 7 dias', value: this.resumenPromedio7d.cobrado }
        ]
      },
      {
        name: 'Egresos',
        series: [
          { name: 'Hoy', value: this.resumenHoy.egresos },
          { name: 'Ayer', value: this.resumenAyer.egresos },
          { name: 'Prom. 7 dias', value: this.resumenPromedio7d.egresos }
        ]
      },
      {
        name: 'Neto',
        series: [
          { name: 'Hoy', value: this.resumenHoy.neto },
          { name: 'Ayer', value: this.resumenAyer.neto },
          { name: 'Prom. 7 dias', value: this.resumenPromedio7d.neto }
        ]
      }
    ];
  }

  private crearIndicadoresVacios(): IndicadoresOperacion {
    return { cobrado: 0, egresos: 0, neto: 0 };
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
    return formatearNumeros(value);
  }

  formatYTicks(value: number): string {
    return formatearNumeros(value);
  }

  variacionTexto(actual: number, referencia: number): string {
    if (referencia === 0 && actual === 0) {
      return 'Sin cambios';
    }

    if (referencia === 0) {
      return 'Sin referencia';
    }

    const variacion = ((actual - referencia) / Math.abs(referencia)) * 100;
    const prefijo = variacion > 0 ? '+' : '';
    return `${prefijo}${variacion.toFixed(1)}% vs ayer`;
  }
}
