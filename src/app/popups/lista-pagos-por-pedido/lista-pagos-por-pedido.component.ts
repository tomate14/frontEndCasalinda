import { CurrencyPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, Input, OnInit, LOCALE_ID } from '@angular/core';
import { Pago } from '../../../clases/dominio/pago';
import { PagosService } from '../../../services/pago.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PedidosService } from '../../../services/pedidos.service';
import { MatSelectModule } from '@angular/material/select';
import { FormaDePago, formaDePago } from '../../../clases/constantes/formaPago';

@Component({
  selector: 'app-lista-pagos-por-pedido',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, CurrencyPipe, ReactiveFormsModule, MatSelectModule],
  templateUrl: './lista-pagos-por-pedido.component.html',
  styleUrl: './lista-pagos-por-pedido.component.css'
})
export class ListaPagosPorPedidoComponent implements OnInit {

  @Input() idPedido: string = "";
  @Input() totalPedido: number = 0;
  @Input() title: string = "";
  pagos: Pago[] = [];
  pagoForm: FormGroup;
  subTotal:number = 0;
  formaDePago:FormaDePago[] = [];

  constructor(private pagosServices: PagosService, private activeModal: NgbActiveModal, private fb: FormBuilder, private pedidosService: PedidosService) { 
    this.formaDePago = formaDePago;
    this.pagoForm = this.fb.group({
      valor: ['', [Validators.required, Validators.min(1)]],
      formaDePago: [1, [Validators.required, Validators.min(1), Validators.max(3)]],
    });
  }

  ngOnInit(): void {
    if (this.idPedido) {
      this.pagosServices.getPagoByIdPedido(this.idPedido).subscribe((res) => {
        this.pagos = res;
        this.actualizarSubTotal();
      })
    }    
  }

  cerrar() {
    this.activeModal.close(false);
  }
  eliminarPago(pago: Pago) {
    const pagoId = pago._id as unknown as string;
      this.pagosServices.deletePagoByIdPago(pagoId).subscribe((res)=> {
        this.pagosServices.getPagoByIdPedido(this.idPedido).subscribe((res) => {
          this.pagos = res;
          this.actualizarSubTotal();
        });
      }, (error) => {
        alert(`No se pudo eliminar el pago ${pagoId}, ${error}`);
      });      
  }
  private actualizarEstado(preSubTotal:number) {
    if (preSubTotal === this.totalPedido) {
      const pedido: any = {
        estado: "COMPLETO",
      }
      this.pedidosService.put(this.idPedido, pedido).subscribe((res) => {
        
      },(error) => {
        alert(error);
      })
    }
  }
  agregarPago() {
    const pago: Pago = {
      idPedido: this.idPedido,
      fechaPago: new Date(),
      valor: this.pagoForm.value.valor,
      formaPago: this.pagoForm.value.formaDePago,
      descripcion:""

    }
    const preSubTotal = this.subTotal + pago.valor;
    if (preSubTotal > this.totalPedido) {
      alert("El valor agregado sobrepasa el valor del pedido");
    } else {
      this.pagosServices.postPago(pago).subscribe((res) => {
        this.pagosServices.getPagoByIdPedido(this.idPedido).subscribe((res) => {
          this.pagos = res;          
          this.actualizarEstado(preSubTotal);
          this.actualizarSubTotal();
          this.pagoForm.reset();
        })
      })
    }   
  }
  actualizarSubTotal(){
    this.subTotal = this.pagos.reduce((acc, pago) => acc + pago.valor, 0);
  }
}
