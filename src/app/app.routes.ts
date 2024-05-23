import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { GenerarComponent } from './components/generar/generar.component';
import { TablaClientesComponent } from './components/tabla-clientes/tabla-clientes.component';

export const routes: Routes = [
    { path: '', component: TablaClientesComponent },
    { path: 'home', component: HomeComponent },
    { path: 'generarPedido', component: GenerarComponent },
    { path: 'clientes', component: TablaClientesComponent }
  ];
