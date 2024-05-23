import { Component, Input } from '@angular/core';
import { Pedido } from '../../../clases/dominio/pedido';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-mostrar-imagen-pedido',
  standalone: true,
  imports: [NgIf],
  templateUrl: './mostrar-imagen-pedido.component.html',
  styleUrl: './mostrar-imagen-pedido.component.css'
})
export class MostrarImagenPedidoComponent {

  @Input() pedido:Pedido | undefined

}
