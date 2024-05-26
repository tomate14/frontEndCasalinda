import { Component, OnInit } from '@angular/core';
import { Color, LegendPosition, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { CajaService } from '../../../services/caja.service';
import { Caja } from '../../../clases/dominio/caja';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {formatDateToDayMonth, horaPrincipioFinDia, getPreviousDays} from "../../../utils/dates";
import { DatePipe } from '@angular/common';
const defaultFormObject = {
  fechaDesde: getPreviousDays(new Date().toUTCString(),false,7),
  fechaHasta: horaPrincipioFinDia(new Date().toUTCString(), true),
}

@Component({
  selector: 'app-flujo-caja',
  standalone: true,
  imports: [NgxChartsModule, ReactiveFormsModule, FormsModule],
  templateUrl: './flujo-caja.component.html',
  styleUrl: './flujo-caja.component.css'
})
export class FlujoCajaComponent {
onSubmit() {
throw new Error('Method not implemented.');
}
  single: any[] = [];
  barrasAcumulado: any[] = [];
  ingresosGastos:any[] =[];
  // options
  gradient: boolean = false;
  showLegend: boolean = false;
  showLabels: boolean = true;
  isDoughnut: boolean = false;
  legendPosition!: LegendPosition;

  // options
  showXAxis: boolean = true;
  showYAxis: boolean = true;
  showLegend2: boolean = true;
  showXAxisLabel: boolean = true;
  xAxisLabel: string = 'Fecha';
  showYAxisLabel: boolean = true;
  yAxisLabel: string = 'Monto';
  animations: boolean = true;
  colorScheme: Color = {
    name: 'customScheme',
    selectable: false,
    group: ScaleType.Time,
    domain: ['#5AA454', '#C7B42C', '#AAAAAA']
  };
  colorIngresosGastos: Color = {
    name: 'customScheme',
    selectable: false,
    group: ScaleType.Time,
    domain: ['#5AA454', '#E73B17']
  };

  fechasBarrasForm: FormGroup;

  constructor(private fb: FormBuilder, private cajaService: CajaService) {
    this.fechasBarrasForm = this.fb.group({});
  }

  ngOnInit() {
    this.fechasBarrasForm = this.fb.group(defaultFormObject);
    this.generarArribaIzquierdaTortas();
    const fechaInicio = getPreviousDays(new Date().toUTCString(),false,7);
    const fechaFin = horaPrincipioFinDia(new Date().toUTCString(), true);
    this.generarArribaDerechaGrafico(fechaInicio, fechaFin);
  }
  
  onSubmitForm() {
    if (this.fechasBarrasForm.valid) {
      const fechaDesde = horaPrincipioFinDia(this.fechasBarrasForm.value.fechaDesde, false);
      const fechaHasta = horaPrincipioFinDia(this.fechasBarrasForm.value.fechaHasta, true);
      this.generarArribaDerechaGrafico(fechaDesde, fechaHasta);
    }
  }

  private generarArribaIzquierdaTortas() {
    const fechaPrevia = getPreviousDays(new Date().toUTCString(), false,1);
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
      this.single = [{"name": "Contado","value": 0},{"name": "Tarjeta","value": 0},{"name": "Cuenta Dni","value": 0}]
    })
  }

}
