import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { horaPrincipioFinDia, nowConLuxonATimezoneArgentina } from '../utils/dates';
import { CajaService } from '../services/caja.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA] 
})
export class AppComponent {
  title = 'generarPedido';
  constructor(private router: Router, private cajaService:CajaService) {}
  cambiarComponente(componente: string) {
    this.router.navigate([`/${componente}`]);
  }

  cerrarCaja() {
    const fecha = nowConLuxonATimezoneArgentina(); 
    const fechaInicio = horaPrincipioFinDia(fecha, false);
    const fechaFin = horaPrincipioFinDia(fecha, true);
    this.cajaService.cierreCaja(fechaInicio, fechaFin).subscribe((res) => {
      console.log(res);
    }, (error)=> {
      console.log(error.error.error);
      alert(error.error.error)
    })
  }
}
