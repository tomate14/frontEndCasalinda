import { CurrencyPipe, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Input, OnInit, LOCALE_ID } from '@angular/core';
import { Pago } from '../../../clases/dominio/pago';
import { PagosService } from '../../../services/pago.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PedidosService } from '../../../services/pedidos.service';
import { MatSelectModule } from '@angular/material/select';
import { FormaDePago, formaDePago } from '../../../clases/constantes/formaPago';
import { formatearFechaDesdeUnIso, nowConLuxonATimezoneArgentina } from '../../../utils/dates';
import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import localeEsArExtra from '@angular/common/locales/extra/es-AR';
import { ConfirmarService } from '../../../services/popup/confirmar';
import { PagosPorPedido } from '../../../clases/dto/pagosPorPedido';
import { Pedido } from '../../../clases/dominio/pedido';

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

  @Input() pedido: Pedido | undefined;
  @Input() totalPedido: number = 0;
  @Input() title: string = "";
  pagos: Pago[] = [];
  pagoForm: FormGroup;
  subTotal:number = 0;
  formaDePago:FormaDePago[] = [];
  respuesta: PagosPorPedido = {
    nombreCliente: '',
    telefonoCliente: '',
    emailCliente: ''
  };

  constructor(private pagosServices: PagosService, private activeModal: NgbActiveModal, private fb: FormBuilder, 
    private pedidosService: PedidosService, private confirmarService:ConfirmarService) { 
    this.formaDePago = formaDePago;
    this.pagoForm = this.fb.group({
      valor: ['', [Validators.required, Validators.min(1)]],
      formaDePago: [1, Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.pedido) {
      const id = this.pedido.id as unknown as string;
      this.pagosServices.getPagoByIdPedido(id).subscribe((res) => {
        this.respuesta = res;
        if (res.pagos) {
          this.pagos = res.pagos;
        }
        this.actualizarSubTotal();
      })
    }    
  }

  cerrar() {
    if (this.pedido) {
      const id = this.pedido.id as unknown as string;
      this.pedidosService.getByIdPedido(id).subscribe((res)=> {
        if (res) {
          this.activeModal.close(res[0]);
        }      
      });
    }
  }
  eliminarPago(pago: Pago) {
    if (this.pedido) { 
      const id = this.pedido.id as unknown as string;
      const pagoId = pago.id as unknown as string;
      this.pagosServices.deletePagoByIdPago(pagoId).subscribe((res)=> {
        this.pagosServices.getPagoByIdPedido(id).subscribe((res) => {
          this.respuesta = res;
          if (res && res.pagos) { 
            this.pagos = res.pagos;
            this.actualizarSubTotal();
          }
        });
      }, (error) => {
        alert(`No se pudo eliminar el pago ${pagoId}, ${error.error.message}`);
      });      
    }
  }

  agregarPago() {
    if (this.pagoForm.valid && this.pedido) { 
      const id = this.pedido.id as unknown as string;     
      const pago: Pago = {
        idPedido: id,
        fechaPago: nowConLuxonATimezoneArgentina(),
        valor: this.pagoForm.value.valor,
        formaPago: +this.pagoForm.value.formaDePago,
        descripcion:`Pago del pedido ${this.pedido.numeroComprobante}`
      }
      const preSubTotal = this.subTotal + pago.valor;
      if (preSubTotal > this.totalPedido) {
        alert("El valor agregado sobrepasa el valor del pedido");
      } else {
        this.pagosServices.postPago(pago).subscribe((res) => {
          this.pagosServices.getPagoByIdPedido(id).subscribe((res) => {
            this.respuesta = res;
            if (res && res.pagos) {
              this.pagos = res.pagos;                        
              this.actualizarEstado(preSubTotal);
              this.actualizarSubTotal();
              this.pagoForm.reset({
                valor: '',
                formaDePago: 1
              });
              res.pagos = [pago];
              this.enviarWP(res);
            }
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

  enviarWP(res: PagosPorPedido) {
    const pago = res && res.pagos ? res.pagos[0] : null;
    const resto = this.totalPedido - this.subTotal;
    if (pago) {
      let body = `Hola ${res.nombreCliente}. Notificamos que el pedido *_${this.pedido?.numeroComprobante}_* registro un pago`;
    
      body = body + ` con fecha *_${formatearFechaDesdeUnIso(pago.fechaPago, 'dd/MM/yyyy HH:mm')}_* por un monto de *_$${pago.valor}_*.`;      
      body = body + ` El saldo restante a abonar es *_$${resto}_*.`;
  
      const encodedMessage = encodeURIComponent(body); // Codificar el mensaje para URL
      const url = `https://wa.me/${res.telefonoCliente}?text=${encodedMessage}`;
      window.open(url);  
    }
  }
  
  enviarPago(pago:Pago) {
    this.respuesta.pagos = [pago];
    this.enviarWP(this.respuesta);
  }

  private actualizarEstado(preSubTotal:number) {
    if (this.pedido) {
      const id = this.pedido.id as unknown as string;   
      if (preSubTotal === this.totalPedido) {
        const pedido: any = {
          estado: "COMPLETO",
        }
        this.pedidosService.put(id, pedido).subscribe((res) => {
          
        },(error) => {
          alert(error.error.message);
        })
      }
    }
  }
}
