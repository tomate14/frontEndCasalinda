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
        estadoEnvio: +1
      }
      this.pedidosService.post(pedido).subscribe(res => {
        const id = res._id as unknown as string;
        const subject = `Casa Linda confirmacion ${this.myForm.value.dni} de pedido ${id}`
        let body = `Confirmamos su pedido con una fecha de entrega estimada de 30 dias habiles aproximadamente.`;
        body = body + ` Asi mismo, tomamos como descripcion del producto: ${this.myForm.value.descripcion}.`;
        body = body + ` Se tomo una seña de $ ${this.myForm.value.seña} y el total es de $ ${this.myForm.value.total}.`;
        const pago: Pago = {
          idPedido:id,
          fechaPago: nowConLuxonATimezoneArgentina(),
          valor: this.myForm.value.seña,
          formaPago: this.myForm.value.formaDePago,
          descripcion:`Pago del pedido ${id}`
        }
        if (pago.valor > 0) {
          this.pagosService.postPago(pago).subscribe((res)=> {    
          }, (error) => {
            this.confirmarService.confirm("Pedidos error", error.error.message, true,"Ok", "No");
          })
        }       
        /*const phoneNumber = "+5492284466452"; // Reemplaza con el número de teléfono en formato internacional
        var encodedMessage = encodeURIComponent(body); // Codificar el mensaje para URL
        var url = "https://wa.me/" + phoneNumber + "?text=" + encodedMessage;
        window.open(url, "_blank");  */
        window.open(`mailto:${this.myForm.value.email}?subject=${subject}&body=${body}`);  
        this.myForm.reset(); 
        this.activeModal.close(res);      
      })
    }
  }

  enviarWp() {
    if (this.myForm.valid) {
      let body = `Hola ${this.myForm.value.nombre}. Confirmamos su pedido con una fecha de entrega estimada de *_30 dias_* habiles aproximadamente.`;
      body = body + ` Asi mismo, tomamos como descripcion del producto: ${this.myForm.value.descripcion}.`;
      body = body + ` Se tomo una seña de *_$${this.myForm.value.seña}_* y el total es de *_$${this.myForm.value.total}_*.`;

      const phoneNumber = this.cliente?.telefono; // Reemplaza con el número de teléfono en formato internacional
      const encodedMessage = encodeURIComponent(body); // Codificar el mensaje para URL
      const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
      window.open(url);  
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
