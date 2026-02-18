import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormaDePago } from '../../../clases/constantes/formaPago';

@Component({
  selector: 'app-confirmar-comprobante',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CurrencyPipe, NgIf, NgFor],
  templateUrl: './confirmar-comprobante.component.html',
  styleUrl: './confirmar-comprobante.component.css'
})
export class ConfirmarComprobanteComponent {
  myForm: FormGroup;

  @Input() total = 0;
  @Input() tipoComprobante = '';
  @Input() formaDePago: FormaDePago[] = [];
  @Input() solicitarMonto = false;

  errorMonto = '';

  constructor(private fb: FormBuilder, private activeModal: NgbActiveModal) {
    this.myForm = this.fb.group({
      dni: null,
      formaDePago: [null, Validators.required],
      monto: [null]
    });
  }

  ngOnInit(): void {
    if (this.tipoComprobante === 'NDC') {
      this.myForm.get('formaDePago')?.clearValidators();
      this.myForm.get('formaDePago')?.updateValueAndValidity();
    }

    if (this.solicitarMonto) {
      this.myForm.get('monto')?.setValidators([Validators.required, Validators.min(1)]);
      this.myForm.get('monto')?.updateValueAndValidity();
    }
  }

  public decline(): void {
    this.activeModal.close(null);
  }

  public accept(): void {
    this.errorMonto = '';

    if (!this.myForm.valid) {
      this.myForm.markAllAsTouched();
      return;
    }

    const monto = +this.myForm.value.monto || this.total;
    if (this.solicitarMonto && (monto <= 0 || monto >= this.total)) {
      this.errorMonto = 'El monto debe ser inferior al total adeudado.';
      return;
    }

    const response = {
      dni: this.myForm.value.dni || 0,
      formaDePago: +this.myForm.value.formaDePago,
      monto
    };

    this.activeModal.close(response);
  }

  public dismiss(): void {
    this.activeModal.dismiss(null);
  }
}
