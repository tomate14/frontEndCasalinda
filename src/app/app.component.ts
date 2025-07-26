import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { horaPrincipioFinDia, nowConLuxonATimezoneArgentina } from '../utils/dates';
import { CajaService } from '../services/caja.service';
import { ConfirmarService } from '../services/popup/confirmar';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ReactiveFormsModule, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA] 
})
export class AppComponent {

  title = 'generarPedido';
  isUsuariosCollapsed = true;
  isComprobanteCollapsed = true;
  constructor(private router: Router, private cajaService:CajaService, private confirmarService:ConfirmarService) {}
  cambiarComponente(componente: string) {
    if (componente === 'pedidos') {
      this.router.navigate([`/${componente}`, 1]);
    } else if (componente === 'cuentaCorriente') {
      this.router.navigate([`/${componente}`, 2]);
    }else if (componente === 'ordencompra') {
      this.router.navigate([`/${componente}`, 3]);
    }else if (componente === 'ordenventa') {
      this.router.navigate([`/${componente}`, 4]);
    }else if (componente === 'notacredito') {
      this.router.navigate([`/${componente}`, 5]);
    } else if (componente === 'clientes') {
      this.router.navigate([`/${componente}`, 1]);
    }else if (componente === 'proveedores') {
      this.router.navigate([`/${componente}`, 2]);
    } else {
      this.router.navigate([`/${componente}`]);
    }
  }

  cerrarCaja() {
    const mensaje = "Va a cerrar la caja del dia, esta seguro?";
    const titulo = "Cerrar caja";
    this.confirmarService.confirm(titulo, mensaje, false,"Si", "No").then((confirmar)=> {
      if (confirmar) {
        const fecha = nowConLuxonATimezoneArgentina(); 
        const fechaInicio = horaPrincipioFinDia(fecha, false);
        const fechaFin = horaPrincipioFinDia(fecha, true);
        this.cajaService.cierreCaja(fechaInicio, fechaFin).subscribe((res) => {
          if (res.message) {
            this.confirmarService.confirm("Cierre de caja", res.message, true,"Ok", "");
          } else {
            const saldoCaja = res.contado + res.diferencia;
            this.confirmarService.confirm("Cierre de caja", `El efectivo en caja deberia ser $${saldoCaja}`, true,"Ok", "");
          }
        }, (error)=> {
          this.confirmarService.confirm("Error", error.error.text, true,"Ok", "");
        })
      }
    })    
  }
  toggleCollapse(item: string) {
    if (item === 'usuario') {
      this.isUsuariosCollapsed = !this.isUsuariosCollapsed;
    } else if (item === 'comprobante') {
      this.isComprobanteCollapsed = !this.isComprobanteCollapsed;
    }
  }
}
