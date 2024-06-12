import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Pedido } from '../../../clases/dominio/pedido';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { PedidosService } from '../../../services/pedidos.service';
import { EstadoEnvio, estadoDeEnvio } from '../../../clases/constantes/estadoEnvio';

@Component({
  selector: 'app-editar-pedido',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, ReactiveFormsModule, FormsModule],
  templateUrl: './editar-pedido.component.html',
  styleUrl: './editar-pedido.component.css'
})
export class EditarPedidoComponent {

  myForm: FormGroup;
  @Input() pedido:Pedido | undefined;
  PENDIENTE: string = "PENDIENTE";
  COMPLETO: string = "COMPLETO";
  estadoDeEnvio:EstadoEnvio[] = [];

  constructor(private fb: FormBuilder, private activeModal: NgbActiveModal, private pedidosService: PedidosService) {    

      this.myForm = this.fb.group({}); 
  }

  ngOnInit(): void {
    this.estadoDeEnvio = estadoDeEnvio;
    if (this.pedido) {
      this.myForm = this.fb.group({      
        descripcion: [this.pedido.descripcion, Validators.required],      
        total: [this.pedido.total, Validators.required],
        tipoPedido: [this.pedido.tipoPedido, Validators.required],
        estado: [this.pedido.estado, Validators.required],
        estadoDeEnvio: [this.pedido.estadoEnvio, Validators.required],
      }); 
    }
  }

  onSubmit() {
    if (this.myForm.valid) {
      
      const pedido:Pedido = {
        total: this.myForm.value.total,
        descripcion: this.myForm.value.descripcion,
        tipoPedido: +this.myForm.value.tipoPedido,
        estado: this.myForm.value.estado,
        estadoEnvio: +this.myForm.value.estadoDeEnvio,
      }
      const idPedido = this.pedido?._id  as unknown as string;
      if (idPedido) {
        this.pedidosService.put(idPedido, pedido).subscribe(res => {
          pedido._id = this.pedido?._id;
          this.activeModal.close(pedido);
        }, (error) => {
          alert(error.error.message);
        })
      }
    }
  }

  cerrar() {
    this.myForm.reset();
    this.activeModal.close(false);
  }
}
