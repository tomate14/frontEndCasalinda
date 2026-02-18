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
  totales = { contado: 0, cuentaDni:0, tarjeta:0, transferencia:0, ganancia:0, gastos:0 }
  myForm: FormGroup;
  isFormVisible: boolean = false;

  xAxisLabel: string = 'Fecha';
  yAxisLabel: string = 'Monto';

  colorHistograma: Color = {
    name: 'customScheme',
    selectable: false,
    group: ScaleType.Time,
    domain: [coloresGrafico.contado, coloresGrafico.cuentaDni, coloresGrafico.tarjeta, coloresGrafico.transferencia, coloresGrafico.ganancia, coloresGrafico.gastos]
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
          const cuentaDni = dataSet.find((c)=> c.name === "CuentaDni");
          const tarjeta = dataSet.find((c)=> c.name === "Tarjeta");
          const transferencia = dataSet.find((c)=> c.name === "Transferencia");
          const ganancias = dataSet.find((c)=> c.name === "Ganancia");
          const gastos = dataSet.find((c)=> c.name === "Gastos"); 
          const fecha = formatDateToDayMonth(element.fecha);
          if (!contado) {
            dataSet.push({ name: 'Contado', series: [{"name": fecha,"value": element.contado, "extra": {date: element.fecha} }]});
            dataSet.push({ name: 'CuentaDni', series: [{"name": fecha,"value": element.cuentaDni }]});
            dataSet.push({ name: 'Tarjeta', series: [{"name": fecha,"value": element.tarjeta }]});
            dataSet.push({ name: 'Transferencia', series: [{"name": fecha,"value": element.transferencia }]});
            dataSet.push({ name: 'Ganancia', series: [{"name": fecha,"value": element.ganancia }]});
            dataSet.push({ name: 'Gastos', series: [{"name": fecha,"value": element.gastos }]});
          } else {
            contado.series.push({"name": fecha,"value": element.contado })
            cuentaDni.series.push({"name": fecha,"value": element.cuentaDni })
            tarjeta.series.push({"name": fecha,"value": element.tarjeta })
            transferencia.series.push({"name": fecha,"value": element.transferencia })
            ganancias.series.push({"name": fecha,"value": element.ganancia })
            gastos.series.push({"name": fecha,"value": element.gastos })
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
        const pagos = res.filter((p) => p.idPedido !== -2 && p.idPedido !== -3);
        const ingresosRetiros = res.filter((p) => p.idPedido === -2 || p.idPedido === -3);
        this.cajaPasadaModal.mostrarPagosPasados(pagos, ingresosRetiros).then((res)=>{
          console.log(res);
        })
      }
    })
  }

  private generarTotales(cajas:Caja[]) {
    this.totales = { contado: 0, cuentaDni:0, tarjeta:0, transferencia:0, ganancia:0, gastos:0 }
    cajas.forEach((caja:Caja)=>{
      this.totales.contado += caja.contado;
      this.totales.cuentaDni += caja.cuentaDni;
      this.totales.tarjeta += caja.tarjeta;
      this.totales.transferencia += caja.transferencia;
      this.totales.ganancia += caja.ganancia;
      this.totales.gastos += caja.gastos;
    })
    const histo:any[] = [];

    histo.push({
      name: 'Contado',
      value: new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(this.totales.contado)
    });
    histo.push({
      name: 'CuentaDni',
      value: new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(this.totales.cuentaDni)
    })
    histo.push({
      name: 'Tarjeta',
      value: new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(this.totales.tarjeta)
    })
    histo.push({
      name: 'Transferencia',
      value: new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(this.totales.transferencia)
    })
    histo.push({
      name: 'Ganancia',
      value: new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(this.totales.ganancia)
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
