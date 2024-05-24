import { CurrencyPipe, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormaDePago, formaDePago } from '../../../clases/constantes/formaPago';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Pago } from '../../../clases/dominio/pago';
import { PagosService } from '../../../services/pago.service';
@Component({
  selector: 'app-tabla-caja',
  standalone: true,
  imports: [NgClass, NgFor, NgbModule, NgIf, ReactiveFormsModule, DatePipe, CurrencyPipe,
    FormsModule, NgxPaginationModule, MatInputModule, MatSelectModule ],
  templateUrl: './tabla-caja.component.html',
  styleUrl: './tabla-caja.component.css'
})
export class TablaCajaComponent implements OnInit{

  myForm: FormGroup;
  isFormVisible: boolean = false;
  formaDePago:FormaDePago[] = [];
  esIngreso:boolean = true;
  pagos:Pago[] = [];
  totalContado:number = 0;
  totalTarjeta:number = 0;
  totalDNI:number = 0;

  constructor(private fb: FormBuilder, private pagosServices: PagosService) {
    this.formaDePago = formaDePago;
    this.myForm = this.fb.group({
      descripcion: ['', Validators.required],
      valor: [null, [Validators.required, Validators.min(0)]],
      formaDePago: [1, Validators.required]
    });
  }

  ngOnInit(): void {
    const fechas = this.getHorasConsulta();
      this.pagosServices.getCajaByDate(fechas[0], fechas[1]).subscribe((res) => {
        this.pagos = res;
        this.actualizarTotales();
      })
  }

  toggleForm(esIngreso:boolean) {
    this.isFormVisible = !this.isFormVisible;
    this.esIngreso = esIngreso;
  }

  onSubmit() {
    if (this.myForm.valid) {
      const pago: Pago = {
        idPedido: "-1",
        fechaPago: new Date(),
        valor: this.esIngreso ? this.myForm.value.valor : -this.myForm.value.valor,
        formaPago: +this.myForm.value.formaDePago,
        descripcion: this.myForm.value.descripcion  
      }
      this.pagosServices.postPago(pago).subscribe((res) => {
        this.myForm.reset({descripcion: '',valor: null,formaDePago: 1});
        this.actualizarTotalesPorPago(pago);
        this.pagos.push(res);
      })
    } else {
      alert('Debe agregar los valores');
    }
  }

  editarPago(pago: Pago) {
    
  }

  eliminarPago(pago: Pago) {
    const pagoId = pago._id as unknown as string;
      this.pagosServices.deletePagoByIdPago(pagoId).subscribe((res)=> {
        let index = this.pagos.findIndex(item => item._id === pago._id);

        if (index > -1) {
          this.pagos.splice(index, 1);
        }
        //Si elimino y resta, se suma. Si elimino y suma, se resta
        pago.valor = -pago.valor;
        this.actualizarTotalesPorPago(pago);
      }, (error) => {
        alert(`No se pudo eliminar el pago ${pagoId}, ${error}`);
      });      
  }

  private getHorasConsulta(): string[] {
    // Obtener la fecha actual
    let currentDate = new Date();

    // Crear una nueva fecha para la fecha de inicio del día
    let startOfDay = new Date(currentDate);
    startOfDay.setUTCHours(0, 0, 0, 0); // Establecer a las 00:00:00.000 UTC

    // Crear una nueva fecha para la fecha de fin del día
    let endOfDay = new Date(currentDate);
    endOfDay.setUTCHours(23, 59, 59, 999); // Establecer a las 23:59:59.999 UTC

    // Convertir a formato ISO string para asegurar formato correcto
    let fechaInifico = startOfDay.toISOString();
    let fechaFin = endOfDay.toISOString();

    return [fechaInifico, fechaFin]
  }

  private actualizarTotalesPorPago(pago:Pago) {
    pago.formaPago ===  1 ? this.totalContado += pago.valor : null;
    pago.formaPago ===  2 ? this.totalTarjeta += pago.valor : null;
    pago.formaPago ===  3 ? this.totalDNI += pago.valor : null;
  }

  private actualizarTotales() {
    this.pagos.forEach((pago) => {
      this.actualizarTotalesPorPago(pago);
    })
  }
}
