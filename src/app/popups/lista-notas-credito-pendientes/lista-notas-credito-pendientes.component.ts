import { CurrencyPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NotaCreditoPendiente } from '../../../clases/dto/notaCreditoPendiente';

@Component({
  selector: 'app-lista-notas-credito-pendientes',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, DatePipe, CurrencyPipe],
  templateUrl: './lista-notas-credito-pendientes.component.html',
  styleUrl: './lista-notas-credito-pendientes.component.css'
})
export class ListaNotasCreditoPendientesComponent {
  @Input() title = 'Notas de credito pendientes';
  @Input() notasCredito: NotaCreditoPendiente[] = [];

  seleccion: Record<string, boolean> = {};
  totalSeleccionado = 0;

  constructor(private activeModal: NgbActiveModal) {}

  ngOnInit(): void {
    this.notasCredito.forEach((nota) => {
      this.seleccion[nota.idPedido] = false;
    });
  }

  toggleSeleccion(idPedido: string): void {
    this.seleccion[idPedido] = !this.seleccion[idPedido];
    this.actualizarTotalSeleccionado();
  }

  confirmar(): void {
    const notasSeleccionadas = this.notasCredito.filter((nota) => !!this.seleccion[nota.idPedido]);
    this.activeModal.close(notasSeleccionadas);
  }

  cerrar(): void {
    this.activeModal.close(null);
  }

  private actualizarTotalSeleccionado(): void {
    this.totalSeleccionado = this.notasCredito
      .filter((nota) => !!this.seleccion[nota.idPedido])
      .reduce((acc, nota) => acc + nota.monto, 0);
  }
}
