import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { PedidosService } from '../../../services/pedidos.service';
import { ClienteService } from '../../../services/cliente.service';
import { Cliente } from '../../../clases/dominio/cliente';
import { Pedido } from '../../../clases/dominio/pedido';
import { PagosService } from '../../../services/pago.service';
import { Pago } from '../../../clases/dominio/pago';
import { MatSelectModule } from '@angular/material/select';
import { FormaDePago, formaDePago } from '../../../clases/constantes/formaPago';
import { TipoPedido, tipoDePedido } from '../../../clases/constantes/cuentaCorriente';

import { nowConLuxonATimezoneArgentina } from '../../../utils/dates';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmarService } from '../../../services/popup/confirmar';
import { CrearClienteService } from '../../../services/popup/crearCliente.service';
import { enviarMensajeAltaPedido } from '../../../utils/mensajesWhatsapp';

@Component({
  selector: 'app-generar',
  standalone: true,
  imports: [ NgFor, NgClass, NgIf, ReactiveFormsModule, FormsModule, MatSelectModule],
  templateUrl: './generar.component.html',
  styleUrl: './generar.component.css'
})
export class GenerarComponent {

  myForm: FormGroup;
  cliente:Cliente | undefined;
  imagePath:any = "";
  formaDePago:FormaDePago[] = [];
  tipoDePedido:TipoPedido[] = [];

  constructor(private fb: FormBuilder, private pedidosService: PedidosService, private clienteService: ClienteService,
    private crearClienteService:CrearClienteService, private pagosService: PagosService, private confirmarService: ConfirmarService,
    private activeModal: NgbActiveModal) {    
    this.formaDePago = formaDePago;
    this.tipoDePedido = tipoDePedido;
    this.myForm = this.fb.group({
      nombre: [null, Validators.required],
      email: [null, [Validators.required, Validators.email]],
      descripcion: [null, Validators.required],
      seña: [0, Validators.required], // Set initial value to 0
      total: [null, Validators.required],
      dni: [null, Validators.required],
      formaDePago: [1, Validators.required],
      tipoDePedido: [1, Validators.required],
    }); 
  }

  ngOnInit() { 
    
  }
  buscarCliente() {
    if (this.myForm.value.dni) {
      this.clienteService.getClienteByDni(this.myForm.value.dni).subscribe((res) => {
        this.cliente = res;
      }, (error) => {
        const cliente = undefined;
        this.crearClienteService.crearCliente(cliente)
        .then((cliente) => {
            if(cliente){
              this.cliente =cliente;
            }
        });
      });
    }
    
  }
  onSubmit() {
    if (this.myForm.valid) {      
      
      const estado = this.myForm.value.total === this.myForm.value.seña ? "COMPLETO" : "PENDIENTE";
      const pedido:Pedido = {
        dniCliente: this.myForm.value.dni,
        fechaPedido: nowConLuxonATimezoneArgentina(),
        total: this.myForm.value.total,
        estado: estado,
        descripcion: this.myForm.value.descripcion,
        tipoPedido: +this.myForm.value.tipoDePedido,
        estadoEnvio: +1,
        conSena: this.myForm.value.seña > 0
      }
      this.pedidosService.post(pedido).subscribe(res => {
        const id = res._id as unknown as string;
        const pago: Pago = {
          idPedido:id,
          fechaPago: nowConLuxonATimezoneArgentina(),
          valor: this.myForm.value.seña,
          formaPago: +this.myForm.value.formaDePago,
          descripcion:`Pago del pedido ${id}`
        }
        
        if (pago.valor > 0) {
          this.pagosService.postPago(pago).subscribe((res)=> {    
          }, (error) => {
            this.confirmarService.confirm("Pedidos error", error.error.message, true,"Ok", "No");
          })
        }       
        this.enviarWp(id);
        this.myForm.reset(); 
        this.activeModal.close(res);      
      })
    }
  }
  enviarEmail() {
    const subject = `Casa Linda confirmacion ${this.myForm.value.dni} de pedido`;
    const saldo = this.myForm.value.total - this.myForm.value.seña;
    
    let body = `Confirmamos su pedido con una fecha de entrega estimada de 30 dias habiles aproximadamente. `;
    body = body + `Aclaramos que el pedido puede sufrir atrazos por cuestiones de fuerza mayor.`;
    body = body + ` Asi mismo, tomamos como descripcion del producto: ${this.myForm.value.descripcion}.`;
    body = body + ` Se tomo una seña de $ ${this.myForm.value.seña} y el saldo es de $ ${saldo}.`;
    body = body + ` Recuerde que no contamos con envio propio, el flete tiene un costo adicional a consultar`;
    window.open(`mailto:${this.myForm.value.email}?subject=${subject}&body=${body}`);  
        
  }
  enviarWp(id: string) {
    if (this.myForm.valid) {
      const saldo = this.myForm.value.total - this.myForm.value.seña;
      enviarMensajeAltaPedido(this.myForm.value.nombre, id, this.myForm.value.descripcion, this.myForm.value.seña, saldo, this.cliente?.telefono);
    }
  }
  cerrar() {
    this.myForm.reset();
    this.activeModal.close(false);
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      // Verificar que el archivo sea una imagen
      if (file.type.startsWith('image/')) {
        // Obtener el path del archivo
        this.imagePath = URL.createObjectURL(file);
        // Mostrar el path de la imagen en la consola
        console.log('Path de la imagen seleccionada:', this.imagePath);
      } else {
        console.error('El archivo seleccionado no es una imagen.');
      }
    }
  }
}
