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
  
  @Input() total:number = 0;
  @Input() tipoComprobante:string = "";
  @Input() formaDePago:FormaDePago[] = [];

  constructor(private fb: FormBuilder, private activeModal: NgbActiveModal) {

    this.myForm = this.fb.group({  
      dni: null,    
      formaDePago: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.tipoComprobante === 'NDC') {
      this.myForm.get('formaDePago')?.clearValidators();
      this.myForm.get('formaDePago')?.updateValueAndValidity();
    }
  }

  public decline() {
    this.activeModal.close(null);
  }

  public accept() {
    if (this.myForm.valid) {
      const response = {
        dni: this.myForm.value.dni || 0,
        formaDePago: this.myForm.value.formaDePago
      }
      this.activeModal.close(response);
    }
    
  }

  public dismiss() {
    this.activeModal.dismiss(null);
  }
}
