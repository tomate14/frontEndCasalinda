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
import { formatearFechaDesdeUnIso, getPreviousDays, horaPrincipioFinDia, nowConLuxonATimezoneArgentina, transformarAHoraArgentinaISO } from '../../../utils/dates';
import { CrearPedidoService } from '../../../services/popup/generar-pedidos.service';
import { TipoPedido, tipoDePedido } from '../../../clases/constantes/cuentaCorriente';
import { ActivatedRoute } from '@angular/router';
import { ListarPagosPorPedidosService } from '../../../services/popup/listaPagosPorPedidos.service';
import { EditarPedidoService } from '../../../services/popup/editarPedido.service';
import { EstadoEnvio, estadoDeEnvio } from '../../../clases/constantes/estadoEnvio';
import { PagosService } from '../../../services/pago.service';
import { DeudaPedido } from '../../../clases/dto/deudaPedido';
import { enviarMensajeAltaPedido, notificarDeudaPedido } from '../../../utils/mensajesWhatsapp';

const defaultFormObject = {
  dniCliente: null,
  nombre: null,
  idPedido: null,
  fechaDesde: null,
  fechaHasta: null,
  tipoDePedido:null,
  dias:0,
  estadoDeEnvio:null
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

  constructor(private route: ActivatedRoute, private fb: FormBuilder, private pedidosService: PedidosService, 
    private pagosService: PagosService,
    private crearPedidoModal:CrearPedidoService, private pagosPorPedidosService: ListarPagosPorPedidosService,
    private editarPedidoService:EditarPedidoService) { 
    this.route.params.subscribe(params => {
      this.tipoPedido = +params['id']; // El + convierte el string a number
    });
    this.filterForm = this.fb.group({});
    this.tipoDePedido = tipoDePedido;
  }

  ngOnInit(): void {
    
    this.filterForm = this.fb.group(defaultFormObject);
    this.estadoDeEnvio = estadoDeEnvio;
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
    const { idPedido, dniCliente, nombre, fechaHasta, fechaDesde, estadoDeEnvio } = this.filterForm.value;
    const fechaDesdeLuxon = fechaDesde ? horaPrincipioFinDia(fechaDesde,false) : null;
    const fechaHastaLuxon = fechaHasta ? horaPrincipioFinDia(fechaHasta,true) : null;
    let params = [];
    params.push("tipoPedido="+this.tipoPedido); 
    if (idPedido) {
      params.push("id="+idPedido);
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
    this.crearPedidoModal.crearPedido().then((res)=> {
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
    const pedidoId = pedido._id as unknown as string;
    const totalPedido = pedido.total;
    this.pagosPorPedidosService.crearListaPagos(pedidoId, totalPedido).then((p:Pedido) => {
      const index = this.pedidos.findIndex(c => c._id === p._id);
        if (index !== -1) {
            this.pedidos[index] = p;
        }
    });   
  }

  editarPedido(pedido:Pedido):void {
    this.editarPedidoService.editarPedido(pedido).then((p:Pedido) => {
      if (p) {
        if (p.tipoPedido !== this.tipoPedido) {
          const index = this.pedidos.findIndex(c => c._id === p._id);
          if (index !== -1) {
              this.pedidos.splice(index, 1);
          }
        } else {
          p.dniCliente = pedido.dniCliente;
          p.fechaPedido = pedido.fechaPedido;
          p.nombreCliente = pedido.nombreCliente;
          const index = this.pedidos.findIndex(c => c._id === p._id);
          if (index !== -1) {
              this.pedidos[index] = p;
          }
        }
      }
    })
  }

  notificarDeuda(pedido: Pedido) {
    const pedidoId = pedido._id as unknown as string;
    this.pedidosService.getInformeDeudaPedido(pedidoId).subscribe((res:DeudaPedido) => {
      if (res) {
        this.enviarWP(res);
      }
    })
  }

  enviarConfirmacion(pedido:Pedido) {
    const pedidoId = pedido._id as unknown as string;
    this.pagosService.getPagoByIdPedido(pedidoId).subscribe((res)=> {
      let sena = res.pagos && pedido.conSena ? res.pagos[res.pagos.length - 1].valor : 0;
      let saldo = pedido.total - sena;
      const nombre = pedido.nombreCliente || "";
      enviarMensajeAltaPedido(nombre, pedidoId, pedido.descripcion, sena, saldo, pedido.telefonoCliente);
    })    
  }

  private enviarWP(res:DeudaPedido) {
    notificarDeudaPedido(res);  
  }
}
