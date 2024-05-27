import { Component } from '@angular/core';
import { coloresGrafico } from '../../../../utils/color-graficos';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { getPreviousDays, horaPrincipioFinDia, nowConLuxonATimezoneArgentina } from '../../../../utils/dates';
import { CajaService } from '../../../../services/caja.service';
import { formatearNumeros } from '../../../../utils/formato-numeros';

@Component({
  selector: 'app-grafico-resumen-ultimo-dia',
  standalone: true,
  imports: [NgxChartsModule],
  templateUrl: './grafico-resumen-ultimo-dia.component.html',
  styleUrl: './grafico-resumen-ultimo-dia.component.css'
})
export class GraficoResumenUltimoDiaComponent {
  single: any[] = [];
  ingresosGastos:any[] =[];

  colorScheme: Color = {
    name: 'customScheme',
    selectable: false,
    group: ScaleType.Time,
    domain: [coloresGrafico.contado, coloresGrafico.tarjeta, coloresGrafico.cuentaDni]
  };
  colorIngresosGastos: Color = {
    name: 'customScheme',
    selectable: false,
    group: ScaleType.Time,
    domain: [coloresGrafico.ingresos, coloresGrafico.gastos]
  };
  // options
  gradient: boolean = false;

  constructor(private cajaService: CajaService) {

  }

  ngOnInit() {
    this.generarArribaIzquierdaTortas();
  }

  private generarArribaIzquierdaTortas() {
    const fechaPrevia = getPreviousDays(nowConLuxonATimezoneArgentina(), false,1);
    const fechaDesde = horaPrincipioFinDia(fechaPrevia, false);
    const fechaHasta = horaPrincipioFinDia(fechaPrevia, true);
    this.cajaService.getCajaByFecha(fechaDesde, fechaHasta).subscribe((res) => {
      if (res) {
        const respuesta = res[0];
        this.ingresosGastos = [{name: "Ingresos", value: respuesta.ingresos}, {name: "Gastos", value: -respuesta.gastos}]
        this.single = [{"name": "Contado","value": respuesta.contado},{"name": "Tarjeta","value": respuesta.tarjeta},{"name": "Cuenta Dni","value": respuesta.cuentaDni}];
      }
    }, (error) => {
      alert(error);
      this.single = [{"name": "Contado","value": 0},{"name": "Tarjeta","value": 0},{"name": "Cuenta Dni","value": 0}]
    });
  }

  formatValues(value: number): string {
    return formatearNumeros(value);
  }
}
