import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Pago } from '../../../clases/dominio/pago';
import { PagosService } from '../../../services/pago.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormaDePago } from '../../../clases/constantes/formaPago';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { esIngresoEgresoCaja } from '../../../utils/funciones';
import { FormaPagoService } from '../../../services/forma-pago.service';

@Component({
  selector: 'app-editar-pedido',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, ReactiveFormsModule, FormsModule],
  templateUrl: './editar-pago.component.html',
  styleUrl: './editar-pago.component.css'
})
export class EditarPagoComponent implements OnInit{

  myForm: FormGroup;
  @Input() pago:Pago | undefined;
  formaDePago:FormaDePago[] = [];

  constructor(private fb: FormBuilder, private pagosService: PagosService, private activeModal: NgbActiveModal,
    private formaPagoService: FormaPagoService) {

      this.myForm = this.fb.group({}); 
  }

  ngOnInit(): void {
    if (this.pago) {
      this.myForm = this.fb.group({      
        descripcion: [this.pago.descripcion, Validators.required],      
        total: [this.pago.valor, Validators.required],
        formaDePago: [this.pago.formaPago, Validators.required]
      }); 
    }
    this.cargarFormasPago();
  }

  private cargarFormasPago(): void {
    this.formaPagoService.getFormasPagoDropdown().subscribe((formasPago) => {
      this.formaDePago = formasPago;
      this.setFormaPagoDefault();
    });
  }

  private setFormaPagoDefault(): void {
    const control = this.myForm.get('formaDePago');
    if (!control) {
      return;
    }
    const valorActual = Number(control.value);
    if (this.formaDePago.some((formaPago) => formaPago.value === valorActual)) {
      return;
    }
    const formaPagoDefault = this.formaDePago.find((formaPago) => formaPago.value === 1) ?? this.formaDePago[0];
    control.setValue(formaPagoDefault ? formaPagoDefault.value : null);
  }

  onSubmit() {
    if (this.myForm.valid) {
      const fechaPago = this.pago?.fechaPago  as unknown as string;
      const pago:Pago = {
        fechaPago: fechaPago,
        valor: this.myForm.value.total,
        descripcion: this.myForm.value.descripcion,
        idPedido: this.pago?.idPedido,
        formaPago: +this.myForm.value.formaDePago
      }
      const idPago = this.pago?.id  as unknown as string;
      if (idPago) {
        this.pagosService.putPago(idPago, pago).subscribe(res => {
          pago.id = this.pago?.id;
          this.activeModal.close(pago);
        }, (error) => {
          alert(error.error.message);
        })
      }
    } else {
      console.log('Form Not Valid');
    }
  }

  esIngresoEgresoCaja(pago: Pago | undefined): any {
    if (pago) {
      return esIngresoEgresoCaja(pago);
    }
    return false;
  }

  cerrar() {
    this.myForm.reset();
    this.activeModal.close(false);
  }
}
