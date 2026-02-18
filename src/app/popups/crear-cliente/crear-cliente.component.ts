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
    const validator = {
      dni: [this.cliente ? this.cliente.dni : null, Validators.required],
      tipoUsuario: [this.cliente ? this.cliente.tipoUsuario : null, Validators.required],
      nombre: [this.cliente ? this.cliente.nombre : null, Validators.required],
      email: [this.cliente ? this.cliente.email : null, [Validators.required, Validators.email]],
      direccion: [this.cliente ? this.cliente.direccion : null, Validators.required],
      telefono: [this.cliente ? this.cliente.telefono : null, Validators.required],
      cuit: [this.cliente ? this.cliente.cuit : null],
      fechaNacimiento: [this.cliente ? this.cliente.fechaNacimiento : null],
      porcentajeRemarcar: [this.cliente ? this.cliente.porcentajeRemarcar : null],
    }

    this.myForm = this.fb.group(validator);
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
        tipoUsuario: +this.myForm.value.tipoUsuario,
        fechaAlta: nowConLuxonATimezoneArgentina(),
        porcentajeRemarcar: +this.myForm.value.porcentajeRemarcar
      }
      if (this.cliente) {
        const idCliente = this.cliente.dni as unknown as number;
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
