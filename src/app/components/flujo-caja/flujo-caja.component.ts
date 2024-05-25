import { Component, OnInit } from '@angular/core';
import { Color, LegendPosition, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { CajaService } from '../../../services/caja.service';


@Component({
  selector: 'app-flujo-caja',
  standalone: true,
  imports: [NgxChartsModule],
  templateUrl: './flujo-caja.component.html',
  styleUrl: './flujo-caja.component.css'
})
export class FlujoCajaComponent {
  single: any[] = [];

  // options
  gradient: boolean = false;
  showLegend: boolean = false;
  showLabels: boolean = true;
  isDoughnut: boolean = false;
  legendPosition!: LegendPosition;

  colorScheme: Color = {
    name: 'customScheme',
    selectable: false,
    group: ScaleType.Ordinal,
    domain: ['#5AA454', '#C7B42C', '#AAAAAA']
  };

  constructor(private cajaService: CajaService) {
    this.cajaService.getCajaByFecha(this.getHorasConsulta()).subscribe((res) => {
      this.single = [
        {
          "name": "Contado",
          "value": res.contado
        },
        {
          "name": "Tarjeta",
          "value": res.tarjeta
        },
        {
          "name": "Cuenta Dni",
          "value": res.cuentaDni
        }
      ];
    }, (error) => {
      alert(error);
      this.single = [
        {
          "name": "Contado",
          "value": 0
        },
        {
          "name": "Tarjeta",
          "value": 0
        },
        {
          "name": "Cuenta Dni",
          "value": 0
        }
      ]
    })
      
  }

  onSelect(event:any) {
    console.log(event);
  }

  private getHorasConsulta(): string {
    // Obtener la fecha actual
    let currentDate = new Date();

    // Crear una nueva fecha para la fecha de fin del día
    let endOfDay = new Date(currentDate);
    endOfDay.setUTCHours(23, 59, 59, 999); // Establecer a las 23:59:59.999 UTC

    let fechaFin = endOfDay.toISOString();

    return fechaFin;
  }
}
