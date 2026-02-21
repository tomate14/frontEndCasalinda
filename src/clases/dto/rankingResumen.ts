export interface RankingProducto {
  idProducto: number;
  nombreProducto: string;
  cantidadVendida: number;
  facturacion: number;
}

export interface RankingCliente {
  dniCliente: number;
  nombreCliente: string;
  netoVenta: number;
}

export interface RankingResumen {
  fechaDesde: string;
  fechaHasta: string;
  topN: number;
  criterioProductos: 'cantidad' | 'facturacion';
  topProductos: RankingProducto[];
  topClientes: RankingCliente[];
}

