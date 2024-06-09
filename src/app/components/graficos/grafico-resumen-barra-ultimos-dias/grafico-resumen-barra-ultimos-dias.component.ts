import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CajaService } from '../../../../services/caja.service';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { formatDateToDayMonth, formatearFechaDesdeUnIso, generarFechasFromMonthPicker, getPreviousDays, horaPrincipioFinDia, nowConLuxonATimezoneArgentina } from '../../../../utils/dates';
import { Caja } from '../../../../clases/dominio/caja';
import { coloresGrafico } from '../../../../utils/color-graficos';
import { DateTime } from 'luxon';

const defaultFormObject = {
    fechaDesde: formatearFechaDesdeUnIso(getPreviousDays(nowConLuxonATimezoneArgentina(),false,7), 'yyyy-MM-dd'),
    fechaHasta: formatearFechaDesdeUnIso(horaPrincipioFinDia(nowConLuxonATimezoneArgentina(), true), 'yyyy-MM-dd'),
    tipoGrafico:1
}

@Component({
  selector: 'app-grafico-resumen-barra-ultimos-dias',
  standalone: true,
  imports: [NgxChartsModule, ReactiveFormsModule, FormsModule],
  templateUrl: './grafico-resumen-barra-ultimos-dias.component.html',
  styleUrl: './grafico-resumen-barra-ultimos-dias.component.css'
})
export class GraficoResumenBarraUltimosDiasComponent {

  fechasBarrasForm: FormGroup;
  barrasAcumulado: any[] = [];
  tipoGrafico:any;
  tipoGraficoNgIf:number = 1;
  colorScheme: Color = {
    name: 'customScheme',
    selectable: false,
    group: ScaleType.Time,
    domain: [coloresGrafico.contado, coloresGrafico.tarjeta, coloresGrafico.cuentaDni, coloresGrafico.transferencia]
  };

  // options
  showXAxis: boolean = true;
  showYAxis: boolean = true;
  showXAxisLabel: boolean = true;
  xAxisLabel: string = 'Fecha';
  yAxisLabel: string = 'Monto';
  showYAxisLabel: boolean = true;
  animations: boolean = true;

  constructor(private fb: FormBuilder, private cajaService: CajaService) {
    this.fechasBarrasForm = this.fb.group({});
  }

  ngOnInit() {
    this.fechasBarrasForm = this.fb.group(defaultFormObject);
    const fechaInicio = getPreviousDays(nowConLuxonATimezoneArgentina(),false,7);
    const fechaFin = horaPrincipioFinDia(nowConLuxonATimezoneArgentina(), true);
    this.generarArribaDerechaGrafico(fechaInicio, fechaFin);
  }

  onSubmitForm() {
    if (this.fechasBarrasForm.valid) {
      if (this.fechasBarrasForm.value.tipoGrafico === "2") {
        const fechas = generarFechasFromMonthPicker(this.fechasBarrasForm.value.fechaDesde, this.fechasBarrasForm.value.fechaHasta);
        if (fechas && fechas.fechaDesde && fechas.fechaHasta) {
          this.generarArribaDerechaGrafico(fechas.fechaDesde, fechas.fechaHasta);
        }
      } else {
        const fechaDesde = horaPrincipioFinDia(this.fechasBarrasForm.value.fechaDesde, false);
        const fechaHasta = horaPrincipioFinDia(this.fechasBarrasForm.value.fechaHasta, true);
        this.generarArribaDerechaGrafico(fechaDesde, fechaHasta);      
      }
      
    }
  }

  onChange(event:any) {
    this.tipoGraficoNgIf = +event.target.value;
  }
  
  // Formato de las etiquetas del eje Y
  formatYTicks(value: number): string {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);
  }

  private procesarPorMes(cajas:Caja[], format: string) {
    const series: any[] = [];
    cajas.forEach((caja) => {
      const mes = formatearFechaDesdeUnIso(caja.fecha, format);
      const serieMes = series.find((c)=> mes === c.name);       
      if (serieMes) {
        serieMes.series[0].value += caja.contado;
        serieMes.series[1].value += caja.cuentaDni;
        serieMes.series[2].value += caja.tarjeta;
        serieMes.series[3].value += caja.transferencia;
      } else {
        series.push({
          "name": formatearFechaDesdeUnIso(caja.fecha, format),
          "series": [
            {"name": "Contado","value": caja.contado },
            {"name": "Cuenta Dni","value": caja.cuentaDni},
            {"name": "Tarjeta","value": caja.tarjeta},
            {"name": "Transferencia","value": caja.transferencia}
            ]
        });
      };
    });
    return series;    
  }

  private procesarPorDia(cajas:Caja[]) {
    const dataSet:any[] = [];
    cajas.forEach((element:Caja) => {           
      dataSet.push({
        "name": formatDateToDayMonth(element.fecha),
        "series": [
          {"name": "Contado","value": element.contado },
          {"name": "Cuenta Dni","value": element.cuentaDni},
          {"name": "Tarjeta","value": element.tarjeta},
          {"name": "Transferencia","value": element.transferencia},
        ]
      });
    });

    return dataSet;
  }
  private generarArribaDerechaGrafico(fechaDesde:string, fechaHasta:string) {
    this.cajaService.getCajaByFecha(fechaDesde, fechaHasta).subscribe((res) => {
      if(res) {
        if (this.fechasBarrasForm.value.tipoGrafico === "2") {
          this.barrasAcumulado = this.procesarPorMes(res, 'LLL yy');
        } else {
          this.barrasAcumulado = this.procesarPorDia(res);
        }
      }
    }, (error) => {
      alert(error);
    })
  }

}
