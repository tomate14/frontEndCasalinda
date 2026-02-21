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
  imagenNoDisponible: boolean = false;
  selectedImageFile: File | undefined;
  selectedImageFileName: string = "";

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
        imagenUrl: [this.pedido.imagenUrl || ""]
      }); 
    }
  }

  get imagenPreviewUrl(): string {
    const imagenUrl = this.myForm.get("imagenUrl")?.value;
    if (typeof imagenUrl === "string" && imagenUrl.trim().length > 0) {
      return imagenUrl.trim();
    }
    return this.pedido?.imagenUrl || "";
  }

  onSubmit() {
    if (this.myForm.valid) {
      const pedido:Pedido = {
        total: this.myForm.value.total,
        descripcion: this.myForm.value.descripcion,
        tipoPedido: +this.myForm.value.tipoPedido,
        estado: this.myForm.value.estado,
        estadoEnvio: +this.myForm.value.estadoDeEnvio,
        imagenUrl: this.myForm.value.imagenUrl?.trim() || "",
      }
      const idPedido = this.pedido?.id  as unknown as string;
      if (idPedido) {
        this.guardarPedidoConImagen(idPedido, pedido);
      }
    }
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedImageFile = input.files && input.files.length > 0 ? input.files[0] : undefined;
    this.selectedImageFileName = this.selectedImageFile?.name || "";
    this.imagenNoDisponible = false;
  }

  onImagenUrlChange() {
    this.imagenNoDisponible = false;
  }

  limpiarRutaImagen() {
    this.myForm.patchValue({ imagenUrl: "" });
    this.imagenNoDisponible = true;
  }

  onImageError() {
    this.imagenNoDisponible = true;
  }

  private guardarPedidoConImagen(idPedido: string, pedido: Pedido) {
    if (this.selectedImageFile) {
      this.pedidosService.subirImagenPedido(idPedido, this.selectedImageFile).subscribe((resConImagen) => {
        const imagenIngresada = pedido.imagenUrl?.trim() || "";
        if (!imagenIngresada && resConImagen.imagenUrl) {
          pedido.imagenUrl = resConImagen.imagenUrl;
          this.myForm.patchValue({ imagenUrl: resConImagen.imagenUrl });
        }
        this.persistirPedido(idPedido, pedido);
      }, (error) => {
        alert(error.error?.message || "No se pudo subir la imagen");
      });
      return;
    }
    this.persistirPedido(idPedido, pedido);
  }

  private persistirPedido(idPedido: string, pedido: Pedido) {
    this.pedidosService.put(idPedido, pedido).subscribe(res => {
      if (this.pedido) {
        this.pedido.descripcion = res.descripcion;
        this.pedido.total = res.total;
        this.pedido.tipoPedido = res.tipoPedido;
        this.pedido.estado = res.estado;
        this.pedido.estadoEnvio = res.estadoEnvio;
        this.pedido.imagenUrl = res.imagenUrl;
      }
      this.activeModal.close(this.pedido);
    }, (error) => {
      alert(error.error.message);
    })
  }

  cerrar() {
    this.myForm.reset();
    this.activeModal.close(false);
  }
}
