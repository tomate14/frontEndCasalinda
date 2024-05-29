import { Routes } from '@angular/router';
import { TablaPedidoComponent } from './components/tabla-pedidos/tabla-pedidos.component';
import { GenerarComponent } from './popups/generar-pedido/generar.component';
import { TablaClientesComponent } from './components/tabla-clientes/tabla-clientes.component';
import { TablaCajaComponent } from './components/tabla-caja/tabla-caja.component';
import { FlujoCajaComponent } from './components/flujo-caja/flujo-caja.component';

export const routes: Routes = [
    { path: '', component: TablaClientesComponent },
    { path: 'pedidos/:id', component: TablaPedidoComponent },
    { path: 'cuentaCorriente/:id', component: TablaPedidoComponent },
    { path: 'clientes', component: TablaClientesComponent },
    { path: 'caja', component: TablaCajaComponent },
    { path: 'estadisticas', component: FlujoCajaComponent }
  ];
