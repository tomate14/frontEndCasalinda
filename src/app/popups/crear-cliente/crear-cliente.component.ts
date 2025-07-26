import { NgClass, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClienteService } from '../../../services/cliente.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Cliente } from '../../../clases/dominio/cliente';
import { nowConLuxonATimezoneArgentina } from '../../../utils/dates';
import {maxLengthValidator} from "../../../validadores/validador8CaracteresDni";

@Component({
  selector: 'app-crear-cliente',
  standalone: true,
  imports: [ NgClass, NgIf, ReactiveFormsModule],
  templateUrl: './crear-cliente.component.html',
  styleUrl: './crear-cliente.component.css'
})
export class CrearClienteComponent {
  myForm: FormGroup;
  @Input() cliente:Cliente | undefined;
  constructor(private fb: FormBuilder, private clienteService: ClienteService, private activeModal: NgbActiveModal) {

    this.myForm = this.fb.group({});
  }

  ngOnInit() {
    this.myForm = this.fb.group({
      nombre: [this.cliente ? this.cliente.nombre : null, Validators.required],
      dni: [this.cliente ? this.cliente.dni : null, [Validators.required, maxLengthValidator(8)]],
      fechaNacimiento: [this.cliente ? this.cliente.fechaNacimiento : null, Validators.required],
      direccion: [this.cliente ? this.cliente.direccion : null, Validators.required],
      telefono: [this.cliente ? this.cliente.telefono : null, Validators.required],
      email: [this.cliente ? this.cliente.email : null, [Validators.required, Validators.email]],
      cuit: [this.cliente ? this.cliente.cuit : null, Validators.required]
    });
  }
  cerrar() {
    this.myForm.reset();
    this.activeModal.close(false);
  }
  onSubmit() {
    if (this.myForm.valid) {
      const cliente = {
        nombre: this.myForm.value.nombre,
        dni: this.myForm.value.dni,
        fechaNacimiento: this.myForm.value.fechaNacimiento,
        direccion: this.myForm.value.direccion,
        telefono: this.myForm.value.telefono,
        email: this.myForm.value.email,
        cuit: this.myForm.value.cuit,
        fechaAlta: nowConLuxonATimezoneArgentina()
      }
      if (this.cliente) {
        const idCliente = this.cliente.id as unknown as string;
        this.clienteService.updateCliente(idCliente, cliente).subscribe((res:Cliente) => {
          this.myForm.reset();
          this.activeModal.close(res);
        },(error: any) => {
          alert('Error al guardar cliente'+ error.error.message);
        });
      } else {
        this.clienteService.postCliente(cliente).subscribe((res:Cliente) => {
          this.myForm.reset();
          this.activeModal.close(res);
        },(error: any) => {
          this.myForm.reset();
          this.activeModal.close(cliente);
          alert('Error al guardar cliente'+ error.error.message);
        });
      }
    }
  }
}
