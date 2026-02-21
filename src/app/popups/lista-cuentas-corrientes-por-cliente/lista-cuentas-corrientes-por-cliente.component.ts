import { CurrencyPipe, NgClass, NgFor, NgIf, registerLocaleData } from '@angular/common';
import { Component, Input, LOCALE_ID } from '@angular/core';
import localeEsAr from '@angular/common/locales/es-AR';
import localeEsArExtra from '@angular/common/locales/extra/es-AR';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { catchError, map } from 'rxjs/operators';
import { forkJoin, firstValueFrom, of } from 'rxjs';
import { Pedido } from '../../../clases/dominio/pedido';
import { PedidosService } from '../../../services/pedidos.service';
import { FormaDePago } from '../../../clases/constantes/formaPago';
import { ConfirmarComprobanteService } from '../../../services/popup/confirmarComprobante.setvice';
import { PagosService } from '../../../services/pago.service';
import { Pago } from '../../../clases/dominio/pago';
import { nowConLuxonATimezoneArgentina } from '../../../utils/dates';
import { ConfirmarService } from '../../../services/popup/confirmar';
import { CuentaCorrienteConDeuda } from '../../../clases/constantes/cuentaCorrienteConDeuda';
import { FormaPagoService } from '../../../services/forma-pago.service';

registerLocaleData(localeEsAr, 'es-AR', localeEsArExtra);

@Component({
  selector: 'app-lista-cuentas-corrientes-por-cliente',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, NgxPaginationModule, CurrencyPipe],
  providers: [{ provide: LOCALE_ID, useValue: 'es-AR' }],
  templateUrl: './lista-cuentas-corrientes-por-cliente.component.html',
  styleUrl: './lista-cuentas-corrientes-por-cliente.component.css'
})
export class ListaCuentasCorrientesPorClienteComponent {

  @Input() title = '';
  @Input() cuentasCorrientes: Pedido[] = [];

  cuentasCorrientesConDeuda: CuentaCorrienteConDeuda[] = [];
  totalAdeudado = 0;
  p = 1;
  cargando = true;
  procesandoPago = false;
  formaDePago: FormaDePago[] = [];

  constructor(
    private activeModal: NgbActiveModal,
    private pedidosService: PedidosService,
    private confirmarComprobanteService: ConfirmarComprobanteService,
    private pagosService: PagosService,
    private confirmarService: ConfirmarService,
    private formaPagoService: FormaPagoService
  ) {}

  ngOnInit(): void {
    this.cargarFormasPago();
    void this.cargarDeudas();
  }

  private cargarFormasPago(): void {
    this.formaPagoService.getFormasPagoDropdown().subscribe((formasPago) => {
      this.formaDePago = formasPago;
    });
  }

  async registrarPago(): Promise<void> {
    if (this.totalAdeudado <= 0 || this.procesandoPago) {
      return;
    }
    if (!this.formaDePago.length) {
      this.confirmarService.confirm('Formas de pago', 'No hay formas de pago disponibles.', true, 'Ok', 'No');
      return;
    }

    const res = await this.confirmarComprobanteService.confirm(
      this.totalAdeudado,
      'Pago de Cuenta Corriente',
      this.formaDePago,
      true
    );

    if (!res) {
      return;
    }

    const montoAPagar = +res.monto;
    const formaPago = +res.formaDePago;

    if (!montoAPagar || montoAPagar >= this.totalAdeudado) {
      this.confirmarService.confirm('Monto invalido', 'El monto debe ser inferior al total adeudado.', true, 'Ok', 'No');
      return;
    }

    const cuentasConSaldo = [...this.cuentasCorrientesConDeuda]
      .filter((cuenta) => cuenta.montoRestante > 0 && !!cuenta.idPedido)
      .sort((a, b) => a.numeroComprobante.localeCompare(b.numeroComprobante, 'es', { numeric: true, sensitivity: 'base' }));

    let restante = montoAPagar;
    this.procesandoPago = true;

    try {
      for (const cuenta of cuentasConSaldo) {
        if (restante <= 0) {
          break;
        }

        const montoAplicado = Math.min(restante, cuenta.montoRestante);
        if (montoAplicado <= 0) {
          continue;
        }

        const pago: Pago = {
          idPedido: cuenta.idPedido as unknown as number,
          fechaPago: nowConLuxonATimezoneArgentina(),
          valor: montoAplicado,
          formaPago,
          descripcion: `Pago del pedido ${cuenta.numeroComprobante}`
        };

        await firstValueFrom(this.pagosService.postPago(pago));

        const saldoLuegoPago = cuenta.montoRestante - montoAplicado;
        if (saldoLuegoPago <= 0) {
          await firstValueFrom(this.pedidosService.put(cuenta.idPedido, { estado: 'COMPLETO' } as Pedido));
        }

        restante -= montoAplicado;
      }

      await this.cargarDeudas();
    } catch (error: any) {
      this.confirmarService.confirm('Error al registrar pago', error?.error?.message || 'No se pudo registrar el pago.', true, 'Ok', 'No');
    } finally {
      this.procesandoPago = false;
    }
  }

  cerrar(): void {
    this.activeModal.close(false);
  }

  private async cargarDeudas(): Promise<void> {
    this.cargando = true;

    if (!this.cuentasCorrientes.length) {
      this.cuentasCorrientesConDeuda = [];
      this.totalAdeudado = 0;
      this.cargando = false;
      return;
    }

    const requests = this.cuentasCorrientes.map((pedido) => {
      if (!pedido.id) {
        return of({
          idPedido: '',
          numeroComprobante: pedido.numeroComprobante || '-',
          montoTotal: pedido.total,
          montoRestante: pedido.total
        });
      }

      return this.pedidosService.getInformeDeudaPedido(pedido.id).pipe(
        map((deuda) => ({
          idPedido: pedido.id || '',
          numeroComprobante: pedido.numeroComprobante || deuda.numeroComprobante || '-',
          montoTotal: pedido.total,
          montoRestante: deuda.saldoRestante
        })),
        catchError(() => of({
          idPedido: pedido.id || '',
          numeroComprobante: pedido.numeroComprobante || '-',
          montoTotal: pedido.total,
          montoRestante: pedido.total
        }))
      );
    });

    const rows = await firstValueFrom(forkJoin(requests));
    this.cuentasCorrientesConDeuda = rows;
    this.totalAdeudado = rows.reduce((acc, row) => acc + row.montoRestante, 0);
    this.cargando = false;
  }
}
