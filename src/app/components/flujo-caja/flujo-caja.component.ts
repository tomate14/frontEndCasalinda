import { Component } from '@angular/core';

import { GraficoHistogramaComponent } from '../graficos/grafico-histograma/grafico-histograma.component';
import { TablaCajaHistorialComponent } from '../tabla-caja-historial/tabla-caja-historial.component';
import { GraficoResumenUltimoDiaComponent } from '../graficos/grafico-resumen-ultimo-dia/grafico-resumen-ultimo-dia.component';
import { GraficoResumenBarraUltimosDiasComponent } from '../graficos/grafico-resumen-barra-ultimos-dias/grafico-resumen-barra-ultimos-dias.component';

@Component({
  selector: 'app-flujo-caja',
  standalone: true,
  imports: [TablaCajaHistorialComponent, GraficoHistogramaComponent, GraficoResumenUltimoDiaComponent,GraficoResumenBarraUltimosDiasComponent],
  templateUrl: './flujo-caja.component.html',
  styleUrl: './flujo-caja.component.css'
})
export class FlujoCajaComponent {

  constructor() {  }
  
}
