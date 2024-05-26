import { CurrencyPipe, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, LOCALE_ID } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Caja } from '../../../clases/dominio/caja';
import { CajaService } from '../../../services/caja.service';
import { horaPrincipioFinDia, getPreviousDays} from "../../../utils/dates";

import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import localeEsArExtra from '@angular/common/locales/extra/es-AR';

registerLocaleData(localeEsAr, 'es-AR', localeEsArExtra);

@Component({
  selector: 'app-tabla-caja-historial',
  standalone: true,
  imports: [NgClass, NgFor, NgbModule, NgIf, ReactiveFormsModule, DatePipe, CurrencyPipe, FormsModule ],
  providers: [{ provide: LOCALE_ID, useValue: 'es-AR' }],
  templateUrl: './tabla-caja-historial.component.html',
  styleUrl: './tabla-caja-historial.component.css'
})
export class TablaCajaHistorialComponent implements OnInit {
  myForm: FormGroup;
  isFormVisible: boolean = false;
  cajas: Caja[] = [];
  totales = {
    contado: 0, tarjeta:0, cuentaDni:0, ingresos:0, gastos:0
  }
  constructor(private fb: FormBuilder, private cajaServices: CajaService) {
    this.myForm = this.fb.group({
      fechaDesde: ['', Validators.required],
      fechaHasta: ['', Validators.required]
    });
  }

  ngOnInit() {
    const fechaInicio = getPreviousDays(new Date().toUTCString(),false,7);
    const fechaFin = horaPrincipioFinDia(new Date().toUTCString(), true);
    this.cajaServices.getCajaByFecha(fechaInicio, fechaFin).subscribe((res) => {
      if (res) {
        this.cajas = res;
        this.generarTotales(res);
        
      }
    })
  }

  verMovimientos(caja:Caja) {

  }
  private generarTotales(cajas:Caja[]) {
    cajas.forEach((caja:Caja)=>{
      this.totales.contado += caja.contado;
      this.totales.tarjeta += caja.tarjeta;
      this.totales.cuentaDni += caja.cuentaDni;
      this.totales.ingresos += caja.ingresos;
      this.totales.gastos = this.totales.gastos - caja.gastos;
    })
  }

  onSubmitForm() {
    if (this.myForm.valid) {
      this.totales = {contado: 0, tarjeta:0, cuentaDni:0, ingresos:0, gastos:0};
      const fechaInicio = horaPrincipioFinDia(this.myForm.value.fechaDesde, false);
      const fechaFin = horaPrincipioFinDia(this.myForm.value.fechaHasta, true);
      this.cajaServices.getCajaByFecha(fechaInicio, fechaFin).subscribe((res) => {
        if (res) {
          this.cajas = res;
          this.generarTotales(res);
        }
      })
    }
  }

  toggleForm() {
    this.isFormVisible = !this.isFormVisible;
  }
}
