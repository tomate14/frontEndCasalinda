export interface StockFaltanteItem {
  nombreProducto: string;
  stockActual: number;
  stockNecesario: number;
  faltante: number;
  nombreProveedor: string;
}

export interface StockFaltanteResumen {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  fechaReferencia: string;
  estrategia: string;
  diasReposicion: number;
  diasBuffer: number;
  diasSeguridad: number;
  formulaExplicacion: string;
  items: StockFaltanteItem[];
}
