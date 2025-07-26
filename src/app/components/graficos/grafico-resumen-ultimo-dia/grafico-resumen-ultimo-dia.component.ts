import { Component } from '@angular/core';
import { coloresGrafico } from '../../../../utils/color-graficos';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { horaPrincipioFinDia } from '../../../../utils/dates';
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
    domain: [coloresGrafico.contado, coloresGrafico.cuentaDni, coloresGrafico.tarjeta, coloresGrafico.transferencia]
  };
  colorIngresosGastos: Color = {
    name: 'customScheme',
    selectable: false,
    group: ScaleType.Time,
    domain: [coloresGrafico.ganancia, coloresGrafico.gastos]
  };
  // options
  gradient: boolean = false;

  constructor(private cajaService: CajaService) {

  }

  ngOnInit() {
    this.generarArribaIzquierdaTortas();
  }

  private generarArribaIzquierdaTortas() {
    this.cajaService.getUltimasCajasCerradas().subscribe((res)=> {
      if (res) {
        const fechaDesde = horaPrincipioFinDia(res.fecha, false);
        const fechaHasta = horaPrincipioFinDia(res.fecha, true);

        this.cajaService.getCajaByFecha(fechaDesde, fechaHasta).subscribe((res) => {
          if (res) {
            const respuesta = res[0];
            const ganancia = respuesta.ganancia > 0 ? respuesta.ganancia : 0;
            const gastos = respuesta.gastos > 0 ? respuesta.gastos : 0;
            this.ingresosGastos = [{name: "Ganancia", value: ganancia}, {name: "Gastos", value: gastos}]
            this.single = [{"name": "Contado","value": respuesta.contado},{"name": "Cuenta Dni","value": respuesta.cuentaDni},
              {"name": "Tarjeta","value": respuesta.tarjeta},{"name": "Transferencia","value": respuesta.transferencia}];
          }
        }, (error) => {
          alert(error);
          this.single = [{"name": "Contado","value": 0},{"name": "Cuenta Dni","value": 0},{"name": "Tarjeta","value": 0},{"name": "Transferencia","value": 0}]
        });
      }
    })
  }

  formatValues(value: number): string {
    return formatearNumeros(value);
  }
}
