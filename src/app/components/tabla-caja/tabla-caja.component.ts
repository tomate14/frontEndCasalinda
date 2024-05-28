import { CurrencyPipe, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Input, LOCALE_ID, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormaDePago, formaDePago } from '../../../clases/constantes/formaPago';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Pago } from '../../../clases/dominio/pago';
import { PagosService } from '../../../services/pago.service';
import { horaPrincipioFinDia, nowConLuxonATimezoneArgentina } from '../../../utils/dates';
import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import localeEsArExtra from '@angular/common/locales/extra/es-AR';
import { EditarPagoService } from '../../../services/popup/editarPago';
import { CajaService } from '../../../services/caja.service';
import { ConfirmarService } from '../../../services/popup/confirmar';

registerLocaleData(localeEsAr, 'es-AR', localeEsArExtra);
@Component({
  selector: 'app-tabla-caja',
  standalone: true,
  imports: [NgClass, NgFor, NgbModule, NgIf, ReactiveFormsModule, DatePipe, CurrencyPipe,
    FormsModule, NgxPaginationModule, MatInputModule, MatSelectModule ],
  providers: [{ provide: LOCALE_ID, useValue: 'es-AR' }],
  templateUrl: './tabla-caja.component.html',
  styleUrl: './tabla-caja.component.css'
})
export class TablaCajaComponent implements OnInit{

  myForm: FormGroup;
  isFormVisible: boolean = false;
  formaDePago:FormaDePago[] = [];
  esIngreso:boolean = true;
  totalContado:number = 0;
  totalTarjeta:number = 0;
  totalDNI:number = 0;

  @Input()
  pagos: Pago[] = [];
  @Input()
  readOnly:boolean = false;
  constructor(private fb: FormBuilder, private pagosServices: PagosService, private editarPagoService:EditarPagoService, private cajaService:CajaService,
    private confirmarService: ConfirmarService
  ) {
    this.formaDePago = formaDePago;
    this.myForm = this.fb.group({
      descripcion: ['', Validators.required],
      valor: [null, [Validators.required, Validators.min(0)]],
      formaDePago: [1, Validators.required]
    });
  }

  ngOnInit(): void {
    const fecha = nowConLuxonATimezoneArgentina();
    const fechaDesde = horaPrincipioFinDia(fecha, false);
    const fechaHasta = horaPrincipioFinDia(fecha, true);
    if (!this.readOnly) {
      this.cajaService.getCajaByFecha(fechaDesde, fechaHasta).subscribe((res)=> {
        if (res && res.length > 0) {
          this.readOnly = true;
        }
        this.cargarPagos(fechaDesde, fechaHasta);
      })
    } else {
      this.cargarPagos(fechaDesde, fechaHasta);
    }
  }

  toggleForm(esIngreso:boolean) {
    this.isFormVisible = !this.isFormVisible;
    this.esIngreso = esIngreso;
  }

  onSubmit() {
    if (this.myForm.valid) {
      const pago: Pago = {
        idPedido: "-1",
        fechaPago: nowConLuxonATimezoneArgentina(),
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
    this.editarPagoService.editarPago(pago).then((pago:Pago) => {
      if (pago) {
        const index = this.pagos.findIndex(c => c._id === pago._id);
        if (index !== -1) {
            this.pagos[index] = pago;
        }
        this.actualizarTotales();
      }
    }).catch((error) => {
      console.log(error);
    })
  }

  eliminarPago(pago: Pago) {
    const mensaje = "Desea eliminar?";
    const titulo = "Eliminar pago";
    this.confirmarService.confirm(titulo, mensaje, false,"Si", "No").then((confirmar)=> {
      if (confirmar) {
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
          this.confirmarService.confirm("Error", error.error.error, true,"Ok", "");
        }); 
      }
    })
         
  }
  
  
  private cargarPagos(fechaDesde:string, fechaHasta:string) {
    if (this.pagos.length === 0) {
      this.pagosServices.getCajaByDate(fechaDesde, fechaHasta).subscribe((res) => {
        this.pagos = res;
        this.actualizarTotales();
      })
    } else {
      this.actualizarTotales();
    }
  }
  
  private actualizarTotalesPorPago(pago:Pago) {
    pago.formaPago ===  1 ? this.totalContado += pago.valor : null;
    pago.formaPago ===  2 ? this.totalTarjeta += pago.valor : null;
    pago.formaPago ===  3 ? this.totalDNI += pago.valor : null;
  }

  private actualizarTotales() {
    this.totalContado = 0;
    this.totalTarjeta = 0;
    this.totalDNI = 0;
    this.pagos.forEach((pago) => {
      this.actualizarTotalesPorPago(pago);
    })
  }
}
