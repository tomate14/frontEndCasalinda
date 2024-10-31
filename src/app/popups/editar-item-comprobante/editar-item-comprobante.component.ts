import { Component, Input } from '@angular/core';
import { Producto } from '../../../clases/dominio/producto';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-editar-item-comprobante',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, NgIf, NgClass],
  templateUrl: './editar-item-comprobante.component.html',
  styleUrl: './editar-item-comprobante.component.css'
})
export class EditarItemComprobanteComponent {

  @Input() producto:Producto = {
    nombre: '',
    codigoBarra: '',
    idProveedor: 0,
    stock: 0
  };
  productoForm: FormGroup;

  constructor(private fb: FormBuilder, private activeModal: NgbActiveModal) {
    this.productoForm = this.fb.group({});
  }
  ngOnInit(): void {
    this.productoForm = this.fb.group({
      nombre: [{ value: this.producto.nombre, disabled: true }], // Campo readonly
      stock: [this.producto.stock, [Validators.required, Validators.min(0)]],
      precio: [this.producto.precioVenta || this.producto.precioCompra, [Validators.required, Validators.min(0)]]
    });
  }

   // Método para manejar el envío del formulario
   onSubmit(): void {
    if (this.productoForm.valid) {
      this.activeModal.close(this.productoForm.value);
    }
  }

  cerrar() {
    this.activeModal.close(null);
  }

}
