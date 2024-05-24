import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import { PedidosService } from '../../../services/pedidos.service';
import { ClienteService } from '../../../services/cliente.service';
import { Cliente } from '../../../clases/dominio/cliente';
import { Pedido } from '../../../clases/dominio/pedido';
import { PagosService } from '../../../services/pago.service';
import { Pago } from '../../../clases/dominio/pago';
import { HttpClient } from '@angular/common/http';
import { MatSelectModule } from '@angular/material/select';
import { FormaDePago, formaDePago } from '../../../clases/constantes/formaPago';

@Component({
  selector: 'app-generar',
  standalone: true,
  imports: [ NgClass, NgIf, ReactiveFormsModule, FormsModule, MatSelectModule],
  templateUrl: './generar.component.html',
  styleUrl: './generar.component.css'
})
export class GenerarComponent {

  myForm: FormGroup;
  cliente:Cliente | undefined;
  imagePath:any = "";
  formaDePago:FormaDePago[] = [];

  constructor(private fb: FormBuilder, private pedidosService: PedidosService, private clienteService: ClienteService, private pagosService: PagosService, private httpClient: HttpClient) {    
    this.formaDePago = formaDePago;
    this.myForm = this.fb.group({
      nombre: [null, Validators.required],
      email: [null, [Validators.required, Validators.email]],
      descripcion: [null, Validators.required],
      seña: [0, Validators.required], // Set initial value to 0
      total: [null, Validators.required],
      dni: [null, Validators.required],
      formaDePago: [1, Validators.required]
    }); 
  }

  ngOnInit() { 
    
  }
  buscarCliente() {
    if (this.myForm.value.dni) {
      this.clienteService.getClienteByDni(this.myForm.value.dni).subscribe((res) => {
        this.cliente = res;
      }, (error) => alert("Cliente no encontrado, debe darlo de alta"));
    }
    
  }
  onSubmit() {
    if (this.myForm.valid) {
      let body = `Confirmamos su pedido con una fecha de entrega estimada de 30 dias habiles aproximadamente.`;
      body = body + `Asi mismo, tomamos como descripcion del producto: ${this.myForm.value.descripcion}.`;
      body = body + `Se tomo una seña de $ ${this.myForm.value.seña} y el total es de $ ${this.myForm.value.total}.`;
      const subject = `Casa Linda confirmacion de pedido ${this.myForm.value.dni}`
      const estado = this.myForm.value.total === this.myForm.value.seña ? "COMPLETO" : "PENDIENTE";
      const pedido:Pedido = {
        dniCliente: this.myForm.value.dni,
        fechaPedido: new Date(),
        total: this.myForm.value.total,
        estado: estado,
        descripcion: this.myForm.value.descripcion
      }
      this.pedidosService.post(pedido).subscribe(res => {
        console.log(res);
        const id = res._id as unknown as string;
        const pago: Pago = {
          idPedido:id,
          fechaPago: new Date(),
          valor: this.myForm.value.seña,
          formaPago: this.myForm.value.formaDePago,
          descripcion: ""
        }
        if (pago.valor > 0) {
          this.pagosService.postPago(pago).subscribe((res)=> {            
          }, (error) => {
            alert('Error al agregar pago'+error);
          })
        }       
        window.open(`mailto:${this.myForm.value.email}?subject=${subject}&body=${body}`);   
        this.myForm.reset(); 
      })
    } else {
      console.log('Form Not Valid');
    }
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
