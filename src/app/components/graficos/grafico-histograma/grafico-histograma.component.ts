import { NgClass, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CajaService } from '../../../../services/caja.service';
import { Caja } from '../../../../clases/dominio/caja';
import { horaPrincipioFinDia, getPreviousDays, formatDateToDayMonth, nowConLuxonATimezoneArgentina, formatearFechaDesdeUnIso} from "../../../../utils/dates";
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { coloresGrafico } from '../../../../utils/color-graficos';
import { PagosService } from '../../../../services/pago.service';
import { ListaCajaPasadaService } from '../../../../services/popup/listaCajaPasada';
@Component({
  selector: 'app-grafico-histograma',
  standalone: true,
  imports: [NgClass, NgbModule, NgIf, ReactiveFormsModule, FormsModule, NgxChartsModule ],
  templateUrl: './grafico-histograma.component.html',
  styleUrl: './grafico-histograma.component.css'
})
export class GraficoHistogramaComponent implements OnInit {
  histograma:any[] = [];
  histogramaTotales:any[] = [];
  totales = { contado: 0, tarjeta:0, cuentaDni:0, ingresos:0, gastos:0 }
  myForm: FormGroup;
  isFormVisible: boolean = false;

  xAxisLabel: string = 'Fecha';
  yAxisLabel: string = 'Monto';

  colorHistograma: Color = {
    name: 'customScheme',
    selectable: false,
    group: ScaleType.Time,
    domain: [coloresGrafico.contado, coloresGrafico.tarjeta, coloresGrafico.cuentaDni, coloresGrafico.ingresos, coloresGrafico.gastos]
  };


  cardColor: string = '#FFFFFF';

  constructor(private fb: FormBuilder, private cajaServices: CajaService, private pagosService:PagosService, private cajaPasadaModal: ListaCajaPasadaService) {
    const fechaFin = horaPrincipioFinDia(nowConLuxonATimezoneArgentina(), true);
    const fechaInicio2 = getPreviousDays(nowConLuxonATimezoneArgentina(),false,14);
    this.myForm = this.fb.group({
      fechaDesde: [formatearFechaDesdeUnIso(fechaInicio2, 'yyyy-MM-dd'), Validators.required],
      fechaHasta: [formatearFechaDesdeUnIso(fechaFin, 'yyyy-MM-dd'), Validators.required]
    });
  }

  ngOnInit() {
    const fechaFin = horaPrincipioFinDia(nowConLuxonATimezoneArgentina(), true);
    const fechaInicio2 = getPreviousDays(nowConLuxonATimezoneArgentina(),false,14);
    this.generarAbajoHistograma(fechaInicio2, fechaFin);
  }
  
  onSubmitForm() {
    if (this.myForm.valid) {
      const fechaDesde = horaPrincipioFinDia(this.myForm.value.fechaDesde, false);
      const fechaHasta = horaPrincipioFinDia(this.myForm.value.fechaHasta, true);
      this.generarAbajoHistograma(fechaDesde, fechaHasta);
      
    }
  }

  private generarAbajoHistograma(fechaDesde:string, fechaHasta:string) {
    this.cajaServices.getCajaByFecha(fechaDesde, fechaHasta).subscribe((res) => {
      if(res) {
        const dataSet:any[] = [];
        res.forEach((element:Caja) => {
          const contado = dataSet.find((c)=> c.name === "Contado");
          const tarjeta = dataSet.find((c)=> c.name === "Tarjeta");
          const cuentaDni = dataSet.find((c)=> c.name === "CuentaDni");
          const ingresos = dataSet.find((c)=> c.name === "Ingresos");
          const gastos = dataSet.find((c)=> c.name === "Gastos"); 
          const fecha = formatDateToDayMonth(element.fecha);
          if (!contado) {
            dataSet.push({ name: 'Contado', series: [{"name": fecha,"value": element.contado, "extra": {date: element.fecha} }]});
            dataSet.push({ name: 'Tarjeta', series: [{"name": fecha,"value": element.tarjeta }]});
            dataSet.push({ name: 'CuentaDni', series: [{"name": fecha,"value": element.cuentaDni }]});
            dataSet.push({ name: 'Ingresos', series: [{"name": fecha,"value": element.ingresos }]});
            dataSet.push({ name: 'Gastos', series: [{"name": fecha,"value": -element.gastos }]});
          } else {
            contado.series.push({"name": fecha,"value": element.contado })
            tarjeta.series.push({"name": fecha,"value": element.tarjeta })
            cuentaDni.series.push({"name": fecha,"value": element.cuentaDni })
            ingresos.series.push({"name": fecha,"value": element.ingresos })
            gastos.series.push({"name": fecha,"value": -element.gastos })
          }
        });
        this.histograma = dataSet;
        this.generarTotales(res);        
      }
    }, (error) => {
      alert(error);
    })

  }

  onSelect(data:any): void {
    const fechaDesde = horaPrincipioFinDia(new Date(data.name).toISOString(),false);
    const fechaHasta = horaPrincipioFinDia(new Date(data.name).toISOString(),true);
    this.pagosService.getCajaByDate(fechaDesde, fechaHasta).subscribe((res)=> {
      if (res && res.length > 0) {
        this.cajaPasadaModal.mostrarPagosPasados(res).then((res)=>{
          console.log(res);
        })
      }
    })
  }

  private generarTotales(cajas:Caja[]) {
    this.totales = { contado: 0, tarjeta:0, cuentaDni:0, ingresos:0, gastos:0 }
    cajas.forEach((caja:Caja)=>{
      this.totales.contado += caja.contado;
      this.totales.tarjeta += caja.tarjeta;
      this.totales.cuentaDni += caja.cuentaDni;
      this.totales.ingresos += caja.ingresos;
      this.totales.gastos = this.totales.gastos - caja.gastos;
    })
    const histo:any[] = [];

    histo.push({
      name: 'Contado',
      value: new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(this.totales.contado)
    });
    histo.push({
      name: 'Tarjeta',
      value: new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(this.totales.tarjeta)
    })
    histo.push({
      name: 'CuentaDni',
      value: new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(this.totales.cuentaDni)
    })
    histo.push({
      name: 'Ingresos',
      value: new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(this.totales.ingresos)
    })
    histo.push({
      name: 'Gastos',
      value: new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(this.totales.gastos)
    });
    this.histogramaTotales = histo;
  }

  toggleForm() {
    this.isFormVisible = !this.isFormVisible;
  }

  // Formato de las etiquetas del eje Y
  formatYTicks(value: number): string {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);
  }
}
