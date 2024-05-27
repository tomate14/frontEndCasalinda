import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CajaService } from '../../../../services/caja.service';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { formatDateToDayMonth, formatearFechaDesdeUnIso, getPreviousDays, horaPrincipioFinDia, nowConLuxonATimezoneArgentina } from '../../../../utils/dates';
import { Caja } from '../../../../clases/dominio/caja';
import { coloresGrafico } from '../../../../utils/color-graficos';

const defaultFormObject = {
    fechaDesde: formatearFechaDesdeUnIso(getPreviousDays(nowConLuxonATimezoneArgentina(),false,7), 'yyyy-MM-dd'),
    fechaHasta: formatearFechaDesdeUnIso(horaPrincipioFinDia(nowConLuxonATimezoneArgentina(), true), 'yyyy-MM-dd'),
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

  colorScheme: Color = {
    name: 'customScheme',
    selectable: false,
    group: ScaleType.Time,
    domain: [coloresGrafico.contado, coloresGrafico.tarjeta, coloresGrafico.cuentaDni]
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
      const fechaDesde = horaPrincipioFinDia(this.fechasBarrasForm.value.fechaDesde, false);
      const fechaHasta = horaPrincipioFinDia(this.fechasBarrasForm.value.fechaHasta, true);
      this.generarArribaDerechaGrafico(fechaDesde, fechaHasta);
    }
  }

  // Formato de las etiquetas del eje Y
  formatYTicks(value: number): string {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);
  }

  private generarArribaDerechaGrafico(fechaDesde:string, fechaHasta:string) {
    this.cajaService.getCajaByFecha(fechaDesde, fechaHasta).subscribe((res) => {
      if(res) {
        const dataSet:any[] = [];
        res.forEach((element:Caja) => {           
          dataSet.push({
            "name": formatDateToDayMonth(element.fecha),
            "series": [
              {"name": "Contado","value": element.contado },
              {"name": "Tarjeta","value": element.tarjeta},
              {"name": "Cuenta Dni","value": element.cuentaDni}]
          });
        });
        this.barrasAcumulado = dataSet;
      }
    }, (error) => {
      alert(error);
    })
  }
}
