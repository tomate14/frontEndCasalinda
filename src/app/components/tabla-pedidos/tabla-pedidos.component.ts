import { Component, Input, OnInit } from '@angular/core';
import { PedidosService } from '../../../services/pedidos.service';
import { DatePipe, NgFor, NgIf, formatDate } from '@angular/common';
import { Pedido } from '../../../clases/dominio/pedido';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {provideNativeDateAdapter} from '@angular/material/core';
import {MatInputModule} from '@angular/material/input';
import {  getPreviousDays, horaPrincipioFinDia, nowConLuxonATimezoneArgentina } from '../../../utils/dates';
import { CrearPedidoService } from '../../../services/popup/generar-pedidos.service';
import { TipoPedido, tipoDePedido } from '../../../clases/constantes/cuentaCorriente';
import { ActivatedRoute } from '@angular/router';
import { ListarPagosPorPedidosService } from '../../../services/popup/listaPagosPorPedidos.service';
import { EditarPedidoService } from '../../../services/popup/editarPedido.service';
import { EstadoEnvio, estadoDeEnvio } from '../../../clases/constantes/estadoEnvio';
import { PagosService } from '../../../services/pago.service';
import { DeudaPedido } from '../../../clases/dto/deudaPedido';
import { enviarMensajeAltaCC, enviarMensajeAltaPedido, notificarDeudaPedido } from '../../../utils/mensajesWhatsapp';
import { ExportPDFService } from '../../../services/exportPDF.service';

const defaultFormObject = {
  dniCliente: null,
  nombre: null,
  idPedido: null,
  fechaDesde: null,
  fechaHasta: null,
  tipoDePedido:null,
  dias:0,
  estadoDeEnvio:null,
  ordenFecha:1
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ MatFormFieldModule, MatDatepickerModule, NgFor, NgIf, ReactiveFormsModule, FormsModule, NgxPaginationModule, DatePipe, MatInputModule],
  providers: [provideNativeDateAdapter()],
  templateUrl: './tabla-pedidos.component.html',
  styleUrl: './tabla-pedidos.component.css'
})
export class TablaPedidoComponent implements OnInit {

  pedidos: Pedido[] = [];
  filterForm: FormGroup;
  isCollapsed: boolean = true;
  p: number = 1;
  tipoDePedido:TipoPedido[] = [];
  tipoPedido:number= 1;
  estadoDeEnvio:EstadoEnvio[] = [];
  titulo: string = "";

  constructor(private route: ActivatedRoute, private fb: FormBuilder, private pedidosService: PedidosService,
    private pagosService: PagosService,
    private crearPedidoModal:CrearPedidoService, private pagosPorPedidosService: ListarPagosPorPedidosService,
    private editarPedidoService:EditarPedidoService, private exportPDFService:ExportPDFService) {
    this.route.params.subscribe(params => {
      this.tipoPedido = +params['id']; // El + convierte el string a number
    });
    this.filterForm = this.fb.group({});
    this.tipoDePedido = tipoDePedido;

  }

  ngOnInit(): void {

    this.filterForm = this.fb.group(defaultFormObject);
    this.estadoDeEnvio = estadoDeEnvio;
    const itemTipoPedido = this.tipoDePedido.find((tipo)=> tipo.value === this.tipoPedido);
    if (itemTipoPedido) {
      this.titulo = itemTipoPedido.viewValue;
    }
    this.pedidosService.getPedidosPorTipo(this.tipoPedido).subscribe(
      (data: Pedido[]) => {
        this.pedidos = data;
      },
      (error) => {
        this.pedidos = [];
        console.error('Error al obtener los productos '+error);
      }
    );
  }
  buscar() {
    const { idPedido, dniCliente, nombre, fechaHasta, fechaDesde, estadoDeEnvio, ordenFecha } = this.filterForm.value;
    const fechaDesdeLuxon = fechaDesde ? horaPrincipioFinDia(fechaDesde,false) : null;
    const fechaHastaLuxon = fechaHasta ? horaPrincipioFinDia(fechaHasta,true) : null;
    let params = [];
    params.push("tipoPedido="+this.tipoPedido);
    if (idPedido) {
      if (idPedido.length >= 8) {
        params.push("id="+idPedido);
      } else {
        params.push("numeroComprobante="+idPedido);
      }
    }
    if (dniCliente) {
      params.push("dniCliente="+dniCliente);
    }
    if (nombre) {
      params.push("nombreCliente="+nombre);
    }

    if (fechaDesdeLuxon) {
      params.push("fechaDesde="+fechaDesdeLuxon);
    }
    if (fechaHastaLuxon) {
      params.push("fechaHasta="+fechaHastaLuxon);
    }
    if (nombre) {
      params.push("nombreCliente="+nombre);
    }
    if (estadoDeEnvio) {
      params.push("estadoEnvio="+estadoDeEnvio);
    }
    if (ordenFecha) {
      params.push("ordenFecha="+ordenFecha);
    }
    this.pedidosService.getByParams(params).subscribe((res) => {
      this.pedidos = res;
    }, (error) => {
      this.pedidos = []
    });
  }

  limpiar() {
    this.filterForm.reset(defaultFormObject);
    this.pedidosService.getPedidosPorTipo(this.tipoPedido).subscribe(
      (data: Pedido[]) => {
        this.pedidos = data;
      },
      (error) => {
        alert('Error al obtener los productos '+error.error.message);
      }
    );
  }

  crearPedido() {
    const tipoCompro = this.tipoDePedido.find((tipo)=> tipo.value === this.tipoPedido);
    const sigla = tipoCompro?.sigla || 'PED';
    this.crearPedidoModal.crearPedido(sigla, false, null).then((res)=> {
      if(res){
        this.pedidos.unshift(res);
      }
    })
  }

  filtrarDeudores() {
    const { dias } = this.filterForm.value;
    const fechaDesde = getPreviousDays(nowConLuxonATimezoneArgentina(),true,dias);
    this.pedidosService.getPedidosVencidos(fechaDesde, this.tipoPedido).subscribe((res) => {
      this.pedidos = res;
      this.filterForm.reset();
      this.isCollapsed = true;
    })
  }

  verPagos(pedido: Pedido): void {
    const totalPedido = pedido.total;
    this.pagosPorPedidosService.crearListaPagos(pedido, totalPedido).then((p:Pedido) => {
      const index = this.pedidos.findIndex(c => c.id === p.id);
        if (index !== -1) {
            this.pedidos[index] = p;
        }
    });
  }

  editarPedido(pedido:Pedido):void {
    this.editarPedidoService.editarPedido(pedido).then((p:Pedido) => {
      if (p) {
        if (p.tipoPedido !== this.tipoPedido) {
          const index = this.pedidos.findIndex(c => c.id === p.id);
          if (index !== -1) {
              this.pedidos.splice(index, 1);
          }
        } else {
          p.dniCliente = pedido.dniCliente;
          p.fechaPedido = pedido.fechaPedido;
          p.nombreCliente = pedido.nombreCliente;
          const index = this.pedidos.findIndex(c => c.id === p.id);
          if (index !== -1) {
              this.pedidos[index] = p;
          }
        }
      }
    })
  }

  notificarDeuda(pedido: Pedido) {
    const pedidoId = pedido.id as unknown as string;
    this.pedidosService.getInformeDeudaPedido(pedidoId).subscribe((res:DeudaPedido) => {
      if (res) {
        this.enviarWP(res);
      }
    })
  }

  enviarConfirmacion(pedido:Pedido) {
    const pedidoId = pedido.id as unknown as number;
    const numeroComprobante = pedido.numeroComprobante as unknown as string;
    this.pagosService.getPagoByIdPedido(pedidoId).subscribe((res)=> {
      let sena = res.pagos && pedido.conSena ? res.pagos[res.pagos.length - 1].valor : 0;
      let saldo = pedido.total - sena;
      const nombre = pedido.nombreCliente || "";
      if (pedido.tipoPedido === 1) {
        enviarMensajeAltaPedido(nombre, pedidoId, pedido.descripcion, sena, saldo, pedido.telefonoCliente, numeroComprobante);
      } else {
        enviarMensajeAltaCC(nombre, pedidoId, pedido.descripcion, sena, saldo, pedido.telefonoCliente, numeroComprobante);
      }
    })
  }

  imprimirComprobante(pedido: Pedido) {
    if (pedido.id) {
      const idPedido = pedido.id;
      this.exportPDFService.getDocumentoPDF(idPedido).subscribe((res: Blob | MediaSource) => {
        const url = window.URL.createObjectURL(res);
        window.open(url, '_blank');
      }, (error: any) => {
        const message = error?.error?.message || 'Se produjo un error al imprimir el comprobante';
        alert(message);
      });
    }
  }
  mostrarBotonDetalle(pedido:Pedido) {
    return pedido.tipoPedido !== 1 && pedido.tipoPedido !== 2;
  }

  mostrarBotonImprimir(pedido:Pedido) {
    return pedido.tipoPedido >= 1 && pedido.tipoPedido <= 5;
  }

  mostrarEditarYNotificar(pedido:Pedido) {
    return pedido.tipoPedido !== 3 && pedido.tipoPedido !== 4 && pedido.tipoPedido !== 5;
  }
  verPedido(pedido: Pedido) {
    const tipoCompro = this.tipoDePedido.find((tipo)=> tipo.value === this.tipoPedido);
    if ((tipoCompro) && (this.tipoPedido === 3 || this.tipoPedido === 4 || this.tipoPedido === 5)) {
      const sigla = tipoCompro.sigla || 'PED';
      this.crearPedidoModal.crearPedido(sigla, true, pedido).then(res => {
        console.log("asd");
      });
    }
  }

  private enviarWP(res:DeudaPedido) {
    notificarDeudaPedido(res);
  }
}
