import { Routes } from '@angular/router';
import { TablaPedidoComponent } from './components/tabla-pedidos/tabla-pedidos.component';
import { TablaClientesComponent } from './components/tabla-clientes/tabla-clientes.component';
import { TablaCajaComponent } from './components/tabla-caja/tabla-caja.component';
import { FlujoCajaComponent } from './components/flujo-caja/flujo-caja.component';
import { TablaProductoComponent } from './components/tabla-productos/tabla-productos.component';

export const routes: Routes = [
    { path: '', component: TablaClientesComponent },
    { path: 'productos', component: TablaProductoComponent },
    { path: 'pedidos/:id', component: TablaPedidoComponent },
    { path: 'cuentaCorriente/:id', component: TablaPedidoComponent },
    { path: 'clientes/:id', component: TablaClientesComponent },
    { path: 'proveedores/:id', component: TablaClientesComponent },
    { path: 'ordencompra/:id', component: TablaPedidoComponent },
    { path: 'ordenventa/:id', component: TablaPedidoComponent },
    { path: 'notacredito/:id', component: TablaPedidoComponent },
    { path: 'caja', component: TablaCajaComponent },
    { path: 'estadisticas', component: FlujoCajaComponent }
  ];
