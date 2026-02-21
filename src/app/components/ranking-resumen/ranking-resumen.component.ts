import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DateTime } from 'luxon';
import { RankingResumen } from '../../../clases/dto/rankingResumen';
import { RankingService } from '../../../services/ranking.service';
import { horaPrincipioFinDia } from '../../../utils/dates';

@Component({
  selector: 'app-ranking-resumen',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ranking-resumen.component.html',
  styleUrl: './ranking-resumen.component.css'
})
export class RankingResumenComponent implements OnInit {
  filtrosForm: FormGroup;
  resumen: RankingResumen | null = null;
  cargando: boolean = false;
  error: string = '';

  constructor(private fb: FormBuilder, private rankingService: RankingService) {
    const hoy = DateTime.now().setZone('America/Argentina/Buenos_Aires');
    this.filtrosForm = this.fb.group({
      fechaDesde: [hoy.minus({ months: 6 }).toFormat('yyyy-MM-dd'), Validators.required],
      fechaHasta: [hoy.toFormat('yyyy-MM-dd'), Validators.required],
      topN: [10, [Validators.required, Validators.min(1), Validators.max(100)]],
      criterioProductos: ['cantidad', Validators.required]
    });
  }

  ngOnInit(): void {
    this.buscar();
  }

  buscar(): void {
    if (this.filtrosForm.invalid) {
      return;
    }

    const fechaDesde = horaPrincipioFinDia(this.filtrosForm.value.fechaDesde, false);
    const fechaHasta = horaPrincipioFinDia(this.filtrosForm.value.fechaHasta, true);
    const topN = Number(this.filtrosForm.value.topN);
    const criterio = this.filtrosForm.value.criterioProductos as 'cantidad' | 'facturacion';

    this.cargando = true;
    this.error = '';

    this.rankingService.getResumenRanking(fechaDesde, fechaHasta, topN, criterio).subscribe({
      next: (resumen: RankingResumen) => {
        this.resumen = resumen;
        this.cargando = false;
      },
      error: (errorResponse: { error?: { message?: string } }) => {
        this.resumen = null;
        this.error = errorResponse?.error?.message ?? 'No se pudo cargar el ranking';
        this.cargando = false;
      }
    });
  }

  formatMoneda(valor: number): string {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(valor);
  }
}

