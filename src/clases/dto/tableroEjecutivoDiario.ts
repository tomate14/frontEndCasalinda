export interface TableroEjecutivoFormaPago {
  formaPago: number;
  descripcion: string;
  monto: number;
}

export interface TableroEjecutivoDiario {
  fecha: string;
  pedidosCreados: number;
  pedidosPendientes: number;
  pedidosEnProduccion: number;
  pedidosListosParaEntregar: number;
  totalCobrado: number;
  totalEgresos: number;
  netoOperativo: number;
  ingresosCaja: number;
  retirosCaja: number;
  netoCaja: number;
  deudaPendiente: number;
  cantidadCobros: number;
  ticketPromedio: number;
  cobrosPorFormaPago: TableroEjecutivoFormaPago[];
}

