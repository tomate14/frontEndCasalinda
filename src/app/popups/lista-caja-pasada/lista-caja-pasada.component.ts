import { Component, Input } from '@angular/core';
import { TablaCajaComponent } from '../../components/tabla-caja/tabla-caja.component';
import { Pago } from '../../../clases/dominio/pago';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-lista-caja-pasada',
  standalone: true,
  imports: [TablaCajaComponent],
  templateUrl: './lista-caja-pasada.component.html',
  styleUrl: './lista-caja-pasada.component.css'
})
export class ListaCajaPasadaComponent {
  
  @Input() pagos: Pago[] = [];
  @Input() title: string = "Resumen de caja";
  constructor(private activeModal: NgbActiveModal) {

  }

  cerrar() {
    this.activeModal.close(false);
  }

}
