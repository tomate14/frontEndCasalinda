import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Producto } from '../../../clases/dominio/producto';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductoService } from '../../../services/producto.service';
import { ClienteService } from '../../../services/cliente.service';
import { Cliente } from '../../../clases/dominio/cliente';
import { ConfirmarService } from '../../../services/popup/confirmar';

@Component({
  selector: 'app-editar-producto',
  standalone: true,
  imports: [NgClass, NgIf, NgFor, ReactiveFormsModule, FormsModule],
  templateUrl: './editar-producto.component.html',
  styleUrl: './editar-producto.component.css'
})
export class EditarProductoComponent implements OnInit{
  myForm: FormGroup;
  @Input() producto:Producto | undefined;
  proveedores:Cliente[] = [];
  selectedImageFiles: File[] = [];
  private readonly allowedImageTypes = new Set(['image/jpeg', 'image/jpg', 'image/png']);
  private readonly maxImages = 4;

  constructor(private fb: FormBuilder, private productoService: ProductoService, private activeModal: NgbActiveModal, 
    private clientesServices: ClienteService, private confirmarService:ConfirmarService) {

    this.myForm = this.fb.group({});
    
  }
  ngOnInit(): void {
    this.clientesServices.getClientes(2).subscribe((res:Cliente[]) => {
      this.proveedores = res;
    })
    if (this.producto) {
      this.myForm = this.fb.group({      
        codigoBarra: [this.producto.codigoBarra, Validators.required],      
        stock: [this.producto.stock, Validators.required],
        precioCompra: [this.producto.precioCompra, Validators.required],
        precioVenta: [this.producto.precioVenta, Validators.required],
        idProveedor: [this.producto.idProveedor, Validators.required],
        nombre: [this.producto.nombre, Validators.required],
      }); 
    }
  }
  cerrar() {
    this.myForm.reset();
    this.selectedImageFiles = [];
    this.activeModal.close(false);
  }

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    if (files.length > this.maxImages) {
      this.confirmarService.confirm('Imagenes', 'Solo se permiten hasta 4 imagenes.', true, 'Aceptar', '');
      input.value = '';
      this.selectedImageFiles = [];
      return;
    }

    const invalidFile = files.find((file) => !this.allowedImageTypes.has(file.type.toLowerCase()));
    if (invalidFile) {
      this.confirmarService.confirm('Imagenes', 'Formato no valido. Solo JPG/JPEG/PNG.', true, 'Aceptar', '');
      input.value = '';
      this.selectedImageFiles = [];
      return;
    }

    this.selectedImageFiles = files;
  }

  onSubmit() {
    if (this.myForm.valid) {
      
      const producto:Producto = {
        id: this.producto?.id,
        codigoBarra: this.myForm.value.codigoBarra,
        nombre: this.myForm.value.nombre,
        stock: this.myForm.value.stock,
        precioCompra: +this.myForm.value.precioCompra,
        precioVenta: this.myForm.value.precioVenta,
        idProveedor: +this.myForm.value.idProveedor,
      }
      this.productoService.updateProducto(producto).subscribe((res) => {
        const idProducto = res.id || this.producto?.id;
        if (this.selectedImageFiles.length > 0 && idProducto) {
          this.productoService.uploadProductoImagenes(idProducto, this.selectedImageFiles).subscribe(() => {
            this.selectedImageFiles = [];
            this.actualizarProductoLocal(producto, idProducto);
            this.activeModal.close(this.producto);
          }, (error) => {
            this.confirmarService.confirm('Error', error?.error?.message || 'No se pudieron guardar las imagenes', true, 'Aceptar', '');
          });
          return;
        }

        this.actualizarProductoLocal(producto, idProducto);
        this.activeModal.close(this.producto);
      }, (error) => {
        this.confirmarService.confirm('Error', error.error.message, true, 'Aceptar', '');
      })
    }
  }

  private actualizarProductoLocal(producto: Producto, idProducto: number | undefined): void {
    if (this.producto) {
      this.producto.id = idProducto;
      this.producto.codigoBarra = producto.codigoBarra;
      this.producto.nombre = producto.nombre;
      this.producto.stock = producto.stock;
      this.producto.precioCompra = producto.precioCompra;
      this.producto.precioVenta = producto.precioVenta;
      this.producto.idProveedor = producto.idProveedor;
    }
  }
}
