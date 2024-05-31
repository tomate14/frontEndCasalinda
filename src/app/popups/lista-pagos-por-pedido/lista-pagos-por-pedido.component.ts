import { CurrencyPipe, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Input, OnInit, LOCALE_ID } from '@angular/core';
import { Pago } from '../../../clases/dominio/pago';
import { PagosService } from '../../../services/pago.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PedidosService } from '../../../services/pedidos.service';
import { MatSelectModule } from '@angular/material/select';
import { FormaDePago, formaDePago } from '../../../clases/constantes/formaPago';
import { nowConLuxonATimezoneArgentina } from '../../../utils/dates';
import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import localeEsArExtra from '@angular/common/locales/extra/es-AR';
import { ConfirmarService } from '../../../services/popup/confirmar';

registerLocaleData(localeEsAr, 'es-AR', localeEsArExtra);

@Component({
  selector: 'app-lista-pagos-por-pedido',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, CurrencyPipe, ReactiveFormsModule, MatSelectModule, NgClass],
  providers: [{ provide: LOCALE_ID, useValue: 'es-AR' }],
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

  constructor(private pagosServices: PagosService, private activeModal: NgbActiveModal, private fb: FormBuilder, 
    private pedidosService: PedidosService, private confirmarService:ConfirmarService) { 
    this.formaDePago = formaDePago;
    this.pagoForm = this.fb.group({
      valor: ['', [Validators.required, Validators.min(1)]],
      formaDePago: [1, Validators.required]
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
        alert(`No se pudo eliminar el pago ${pagoId}, ${error.error.message}`);
      });      
  }

  agregarPago() {
    if (this.pagoForm.valid) {      
      const pago: Pago = {
        idPedido: this.idPedido,
        fechaPago: nowConLuxonATimezoneArgentina(),
        valor: this.pagoForm.value.valor,
        formaPago: +this.pagoForm.value.formaDePago,
        descripcion:`Pago del pedido ${this.idPedido}`
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
            this.pagoForm.reset({
              valor: '',
              formaDePago: 1
            });
          })
        }, (error) => {
          this.confirmarService.confirm("Caja error", error.error.message, true,"Ok", "No");
        })
      }   
    }
  }
  actualizarSubTotal(){
    this.subTotal = this.pagos.reduce((acc, pago) => acc + pago.valor, 0);
  }

  private actualizarEstado(preSubTotal:number) {
    if (preSubTotal === this.totalPedido) {
      const pedido: any = {
        estado: "COMPLETO",
      }
      this.pedidosService.put(this.idPedido, pedido).subscribe((res) => {
        
      },(error) => {
        alert(error.error.message);
      })
    }
  }
}
