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
import { diferenciaDias, getPreviousDays, horaPrincipioFinDia, nowConLuxonATimezoneArgentina } from '../../../utils/dates';
import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import localeEsArExtra from '@angular/common/locales/extra/es-AR';
import { EditarPagoService } from '../../../services/popup/editarPago';
import { CajaService } from '../../../services/caja.service';
import { ConfirmarService } from '../../../services/popup/confirmar';
import { tipoDePago } from '../../../clases/constantes/tipoPago';

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
  tipoBoton:number = 0;
  totalContado:number = 0;
  totalTarjeta:number = 0;
  totalDNI:number = 0;
  totalTransferencia:number = 0;
  totalIngresosCaja:number = 0;
  totalRetirosCaja:number = 0;

  @Input()
  pagos: Pago[] = [];
  @Input()
  ingresosRetiros: Pago[] = [];

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

  toggleForm(tipoBoton:number) {
    this.isFormVisible = !this.isFormVisible;
    this.tipoBoton = tipoBoton;
  }

  onSubmit() {  
    const pagosSinPedidos = this.pagos.filter((p)=> p.idPedido == -1 || p.idPedido == -2 || p.idPedido == -3)  
    if (pagosSinPedidos && pagosSinPedidos.length === 0) {
      this.checkearCajasSinCerrar();
    } else {
      this.checkearForm();
    }
  }

  editarPago(pago: Pago) {
    this.editarPagoService.editarPago(pago).then((pago:Pago) => {
      if (pago) {
        if (pago.idPedido !== -2 && pago.idPedido !== -3) {
          const index = this.pagos.findIndex(c => c.id === pago.id);
          if (index !== -1) {
              this.pagos[index] = pago;
          }
  
        } else {
          const index = this.ingresosRetiros.findIndex(c => c.id === pago.id);
          if (index !== -1) {
              this.ingresosRetiros[index] = pago;
          }
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
        const pagoId = pago.id as unknown as string;
        this.pagosServices.deletePagoByIdPago(pagoId).subscribe((res)=> {

          if (pago.idPedido !== -2 && pago.idPedido !== -3) {
            let index = this.pagos.findIndex(item => item.id === pago.id);
  
            if (index > -1) {
              this.pagos.splice(index, 1);
            }
          } else {
            let index = this.ingresosRetiros.findIndex(item => item.id === pago.id);
  
            if (index > -1) {
              this.ingresosRetiros.splice(index, 1);
            }
          }
          //Si elimino y resta, se suma. Si elimino y suma, se resta
          pago.valor = -pago.valor;
          this.actualizarTotalesPorPago(pago);
        }, (error) => {
          this.confirmarService.confirm("Error", error.error.message, true,"Ok", "");
        }); 
      }
    })
         
  }
  
  
  private cargarPagos(fechaDesde:string, fechaHasta:string) {
    if (this.pagos.length === 0) {
      this.pagosServices.getCajaByDate(fechaDesde, fechaHasta).subscribe((res) => {
        //Separar pagos de retiros
        this.pagos = res.filter((pago) => pago.idPedido !== -2 && pago.idPedido !== -3);
        this.ingresosRetiros = res.filter((pago) => pago.idPedido === -2 || pago.idPedido === -3);
        this.actualizarTotales();
      })
    } else {
      this.actualizarTotales();
    }
  }
  
  private actualizarTotalesPorPago(pago:Pago) {
    if (pago.idPedido && (pago.idPedido !== -2 && pago.idPedido !== -3)) {
      pago.formaPago ===  1 ? this.totalContado += pago.valor : null;
      pago.formaPago ===  2 ? this.totalTarjeta += pago.valor : null;
      pago.formaPago ===  3 ? this.totalDNI += pago.valor : null;
      pago.formaPago ===  4 ? this.totalTransferencia += pago.valor : null;
    } else {
      pago.idPedido ===  -2 ? this.totalIngresosCaja += pago.valor : null;
      pago.idPedido ===  -3 ? this.totalRetirosCaja += pago.valor : null;
    }
  }

  private actualizarTotales() {
    this.totalContado = 0;
    this.totalTarjeta = 0;
    this.totalTransferencia = 0;
    this.totalDNI = 0;
    this.totalIngresosCaja = 0;
    this.totalRetirosCaja = 0;
    this.pagos.forEach((pago) => {
      this.actualizarTotalesPorPago(pago);
    })
    this.ingresosRetiros.forEach((pago) => {
      this.actualizarTotalesPorPago(pago);
    })
  }

  private generarPromesaCierreCajaViejo(diferenciaDias:number) {
    const fechaDesde = getPreviousDays(nowConLuxonATimezoneArgentina(),false,diferenciaDias);
    const fechaHasta = getPreviousDays(nowConLuxonATimezoneArgentina(),true,diferenciaDias);
    return new Promise<void>((resolve,reject)=> {
      this.cajaService.cierreCaja(fechaDesde, fechaHasta).subscribe((res) => {
        resolve();
      })
    })
  }
  private checkearCajasSinCerrar(): void {
    this.cajaService.getUltimasCajasCerradas().subscribe((res)=> {
      if (res) {
        const fechaActual = nowConLuxonATimezoneArgentina();
        const primerFechaSinCerrar = res;
        const diferencia = diferenciaDias(fechaActual, primerFechaSinCerrar.fecha);
        const promises = [];
        if (diferencia <= 1) {
          //No hay cajas sin cerrar, proceder
          this.checkearForm();
        } else {
          for(let i=diferencia-1; i > 0; i--) {
            promises.push(this.generarPromesaCierreCajaViejo(i));
          }
          Promise.all(promises).then((res)=> {
            this.checkearForm();
          }).catch((error)=> {
            console.log(error);
          })
        }
      } else {
        this.checkearForm();
      }
    })
  
}
  private checkearForm() {
    if (this.myForm.valid) {
      const idPedido: number = tipoDePago[this.tipoBoton];
      const pago: Pago = {
        idPedido: idPedido,
        fechaPago: nowConLuxonATimezoneArgentina(),
        valor: this.tipoBoton === 1 || this.tipoBoton === 3 ? -this.myForm.value.valor : this.myForm.value.valor,
        formaPago: +this.myForm.value.formaDePago,
        descripcion: this.myForm.value.descripcion  
      }
      this.pagosServices.postPago(pago).subscribe((res) => {
        this.myForm.reset({descripcion: '',valor: null,formaDePago: 1});
        this.actualizarTotalesPorPago(pago);
        if (idPedido === -1) {
          this.pagos.unshift(res);
        } else {
          this.ingresosRetiros.unshift(res);
        }
        this.isFormVisible = false;
      }, (error) => {
        this.confirmarService.confirm("Caja error", error.error.message, true,"Ok", "No");
      })
    } else {
      this.confirmarService.confirm("Caja error", "Faltan valores en el formulario", true,"Ok", "No");
    }
  }
}
