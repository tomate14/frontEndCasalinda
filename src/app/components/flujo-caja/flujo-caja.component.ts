import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { GraficoHistogramaComponent } from '../graficos/grafico-histograma/grafico-histograma.component';
import { TablaCajaHistorialComponent } from '../tabla-caja-historial/tabla-caja-historial.component';
import { GraficoResumenUltimoDiaComponent } from '../graficos/grafico-resumen-ultimo-dia/grafico-resumen-ultimo-dia.component';
import { GraficoResumenBarraUltimosDiasComponent } from '../graficos/grafico-resumen-barra-ultimos-dias/grafico-resumen-barra-ultimos-dias.component';
import { RankingResumenComponent } from '../ranking-resumen/ranking-resumen.component';
import { TableroEjecutivoDiarioComponent } from '../tablero-ejecutivo-diario/tablero-ejecutivo-diario.component';

@Component({
  selector: 'app-flujo-caja',
  standalone: true,
  imports: [CommonModule, TablaCajaHistorialComponent, GraficoHistogramaComponent, GraficoResumenUltimoDiaComponent, GraficoResumenBarraUltimosDiasComponent, RankingResumenComponent, TableroEjecutivoDiarioComponent],
  templateUrl: './flujo-caja.component.html',
  styleUrl: './flujo-caja.component.css'
})
export class FlujoCajaComponent {
  tabActiva: 'resumen_historico' | 'ranking' = 'resumen_historico';

  constructor() { }

  cambiarTab(tab: 'resumen_historico' | 'ranking'): void {
    this.tabActiva = tab;
  }
}
