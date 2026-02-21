import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DateTime } from 'luxon';
import { StockFaltanteResumen } from '../../../clases/dto/stockFaltanteResumen';
import { StockFaltanteService } from '../../../services/stock-faltante.service';

@Component({
  selector: 'app-stock-faltante-resumen',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './stock-faltante-resumen.component.html',
  styleUrl: './stock-faltante-resumen.component.css'
})
export class StockFaltanteResumenComponent implements OnInit {
  // La pagina pedida por negocio es fija de a 20 registros.
  readonly pageSize: number = 20;
  readonly estrategiaDefault: string = 'estacional_eventos';

  filtrosForm: FormGroup;
  resumen: StockFaltanteResumen | null = null;
  cargando: boolean = false;
  error: string = '';
  ayudaVisible: boolean = false;

  constructor(private fb: FormBuilder, private stockFaltanteService: StockFaltanteService) {
    const hoy = DateTime.now().setZone('America/Argentina/Buenos_Aires');
    this.filtrosForm = this.fb.group({
      // Fecha de referencia para recalcular faltante con corte diario.
      fechaReferencia: [hoy.toFormat('yyyy-MM-dd'), Validators.required],
      estrategia: [this.estrategiaDefault, Validators.required]
    });
  }

  ngOnInit(): void {
    this.buscar(0);
  }

  buscar(page: number): void {
    if (this.filtrosForm.invalid) {
      return;
    }

    const fechaReferencia = this.filtrosForm.value.fechaReferencia as string;
    const estrategia = this.filtrosForm.value.estrategia as string;

    this.cargando = true;
    this.error = '';

    // El backend resuelve formula y paginacion para mantener consistente la logica de negocio.
    this.stockFaltanteService.getListadoStockFaltante(page, this.pageSize, fechaReferencia, estrategia).subscribe({
      next: (resumen: StockFaltanteResumen) => {
        this.resumen = resumen;
        this.cargando = false;
      },
      error: (errorResponse: { error?: { message?: string } }) => {
        this.resumen = null;
        this.error = errorResponse?.error?.message ?? 'No se pudo cargar el listado de stock faltante';
        this.cargando = false;
      }
    });
  }

  paginaAnterior(): void {
    if (!this.resumen || this.resumen.page <= 0) {
      return;
    }
    this.buscar(this.resumen.page - 1);
  }

  paginaSiguiente(): void {
    if (!this.resumen || this.resumen.page + 1 >= this.resumen.totalPages) {
      return;
    }
    this.buscar(this.resumen.page + 1);
  }

  toggleAyuda(): void {
    this.ayudaVisible = !this.ayudaVisible;
  }

  formatFecha(fecha: string): string {
    const parsed = DateTime.fromISO(fecha, { zone: 'America/Argentina/Buenos_Aires' });
    return parsed.isValid ? parsed.toFormat('dd/MM/yyyy') : fecha;
  }
}
