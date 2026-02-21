import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SearchableSelectComponent } from "../../generales/searchable-select/searchable-select.component";
import { ClienteService } from '../../../services/cliente.service';
import { Cliente } from '../../../clases/dominio/cliente';
import { CurrencyPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Producto } from '../../../clases/dominio/producto';
import { ProductoService } from '../../../services/producto.service';
import { ConfirmarService } from '../../../services/popup/confirmar';
import { PedidosService } from '../../../services/pedidos.service';
import { FormaDePago } from '../../../clases/constantes/formaPago';
import { ConfirmarComprobanteService } from '../../../services/popup/confirmarComprobante.setvice';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TipoPedido, tipoDePedido } from '../../../clases/constantes/cuentaCorriente';
import { Pedido } from '../../../clases/dominio/pedido';
import { EditarItemComprobanteService } from '../../../services/popup/editarItemComprobante.service';
import { SeleccionarNotasCreditoService } from '../../../services/popup/seleccionarNotasCredito.service';
import { NotaCreditoPendiente } from '../../../clases/dto/notaCreditoPendiente';
import { firstValueFrom } from 'rxjs';
import { PagosService } from '../../../services/pago.service';
import { Pago } from '../../../clases/dominio/pago';
import { nowConLuxonATimezoneArgentina } from '../../../utils/dates';
import { FormaPagoService } from '../../../services/forma-pago.service';

@Component({
  selector: 'app-generar-comprobante',
  standalone: true,
  imports: [SearchableSelectComponent, NgIf, ReactiveFormsModule, FormsModule, NgClass, NgFor, CurrencyPipe],
  templateUrl: './generar-comprobante.component.html',
  styleUrl: './generar-comprobante.component.css'
})
export class GenerarComprobanteComponent implements OnInit{
  cerrar() {
    this.activeModal.close(null);
  }

  tipoUsuario:number = 0;
  usuarios: Cliente[] = [];
  productosProveedor:Producto[] = [];
  productos:Producto[] = [];
  proveedor:Cliente | undefined;
  myForm: FormGroup;
  myFormHeader: FormGroup;
  formaDePago:FormaDePago[] = [];
  selectedFormaDePago:number = 0;
  tipoDePedido:TipoPedido[] = [];
  @Input() readonly:boolean = false;
  @Input() pedido:Pedido | undefined;
  @Input() title:string = '';
  @Input() tipoComprobante:string = '';
  @ViewChild(SearchableSelectComponent)
  proveedorSelect!: SearchableSelectComponent;

  constructor(
    private route: ActivatedRoute,
    private clienteService: ClienteService,
    private fb: FormBuilder,
    private productoService:ProductoService,
    private confirmarService:ConfirmarService,
    private pedidoService: PedidosService,
    private confirmarComprobanteService: ConfirmarComprobanteService,
    private activeModal: NgbActiveModal,
    private editarItemComprobanteService: EditarItemComprobanteService,
    private seleccionarNotasCreditoService: SeleccionarNotasCreditoService,
    private pagosService: PagosService,
    private formaPagoService: FormaPagoService
  ) {
    this.tipoDePedido = tipoDePedido;
    this.myForm = this.fb.group({
      id: null,
      codigoBarra: null,
      stock: [null, Validators.required],
      precio: [null, Validators.required],
      nombre: [null, Validators.required]
    });
    this.myFormHeader = this.fb.group({
      dni: null,
      formaDePago: null
    });
  }

  ngOnInit(): void {
    this.cargarFormasPago();
    if (this.readonly && this.pedido && this.pedido.id) {
      const id = +this.pedido.id;
      this.productoService.getProductoByIdPedido(id).subscribe(res => {
        this.productos = res;
      });
    } else {
      if (this.tipoComprobante === 'ORC') {
        this.tipoUsuario = 2;
        this.clienteService.getClientes(this.tipoUsuario).subscribe(res => {
          this.usuarios = res;
        });
      } else {
        this.tipoUsuario = 0;
        this.productoService.getByParams([]).subscribe(res => {
          this.productosProveedor = res;
        });
      }
    }
  }

  private cargarFormasPago(): void {
    this.formaPagoService.getFormasPagoDropdown().subscribe((formasPago) => {
      this.formaDePago = formasPago;
      const formaPagoDefault = this.formaDePago.find((formaPago) => formaPago.value === 1) ?? this.formaDePago[0];
      this.selectedFormaDePago = formaPagoDefault ? formaPagoDefault.value : 0;
      this.myFormHeader.patchValue({ formaDePago: formaPagoDefault ? formaPagoDefault.value : null });
    });
  }

  validSelection(cliente: Cliente) {
    return this.proveedor && this.tipoComprobante === 'ORC' && this.productos.length > 0 && this.proveedor.dni !== cliente.dni;
  }

  onProveedorSelect(cliente: Cliente) {
    if (cliente) {
      if (this.validSelection(cliente)) {
        this.confirmarService.confirm('Error', 'El proveedor debe ser unico para las Ordenes de Compra', true, 'Aceptar', 'Cancelar');
        this.proveedorSelect.setValue(this.proveedor?.dni);
      } else {
        this.proveedor = cliente;
        const filtro = `idProveedor=${this.proveedor.dni}`;
        this.productoService.getByParams([filtro]).subscribe((res:Producto[]) =>{
          this.productosProveedor = res;
        });
      }
    }
  }

  onProductoSelect(producto: Producto) {
    this.myForm.patchValue({
      id: producto.id,
      nombre: producto.nombre,
      codigoBarra: producto.codigoBarra,
      precio: this.getPrecioProducto(producto)
    });
  }

  async onSubmitHeader() {
    if (!this.myFormHeader.valid) {
      return;
    }

    const total = this.calcularTotal();
    const tipoComprobante = this.tipoComprobante || '';

    try {
      if (!this.checkeoExitoso()) {
        return;
      }

      const res = await this.confirmarComprobanteService.confirm(total, this.tipoComprobante, this.formaDePago);
      if (!res) {
        return;
      }

      let totalFinal = total;
      let notasAplicadas: NotaCreditoPendiente[] = [];

      if (tipoComprobante === 'ORV') {
        const dni = +res.dni || 0;
        if (dni > 0) {
          const notasPendientes = await this.obtenerNotasCreditoPendientes(dni);
          if (notasPendientes.length > 0) {
            const seleccionadas = await this.seleccionarNotasCreditoService.seleccionarNotasCredito(notasPendientes);
            if (seleccionadas === null || seleccionadas.length === 0) {
              const continuarSinNotas = await this.confirmarService.confirm(
                'Sin notas de credito seleccionadas',
                'No selecciono ninguna nota de credito. Desea continuar con el total completo?',
                false,
                'Si',
                'No'
              );

              if (!continuarSinNotas) {
                return;
              }
            } else {
              notasAplicadas = seleccionadas;
              const totalNotas = notasAplicadas.reduce((acc, item) => acc + item.monto, 0);
              const totalNotasAbs = Math.abs(totalNotas);
              if (totalNotasAbs > total) {
                this.confirmarService.confirm('Error', 'Las notas de credito seleccionadas superan el total de la orden de venta', true, 'Aceptar', 'Cancelar');
                return;
              }

              totalFinal = total + totalNotas;
              const totalFinalFormateado = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(totalFinal);
              const confirmarAplicacion = await this.confirmarService.confirm(
                'Confirmar aplicacion de notas de credito',
                `El monto total a cobrar sera ${totalFinalFormateado}. Desea continuar?`,
                false,
                'Si',
                'No'
              );

              if (!confirmarAplicacion) {
                return;
              }

              await this.aplicarNotasCredito(notasAplicadas, +res.formaDePago);
            }
          }
        }
      }

      const pedidoCreado = await firstValueFrom(
        this.pedidoService.crearPedido(this.productos, tipoComprobante, +res.formaDePago, totalFinal, +res.dni || 0)
      );

      if (tipoComprobante === 'ORV' && pedidoCreado.id) {
        await firstValueFrom(this.pedidoService.put(pedidoCreado.id, { estado: 'COMPLETO' } as Pedido));
      }

      this.productos = [];
      this.productosProveedor = [];
      this.activeModal.close(pedidoCreado);
    } catch (error: any) {
      this.confirmarService.confirm('Error', error?.error?.message || error?.message || 'Error al confirmar comprobante', true, 'Aceptar', 'Cancelar');
    }
  }

  onSubmit() {
    if (this.myForm.valid) {
      try {
        const existente = this.productos.filter(prod => prod.id).find(prod => prod.id === this.myForm.value.id);
        if (!existente) {
          const producto:Producto = {
            id: this.myForm.value.id,
            nombre: this.myForm.value.nombre,
            codigoBarra: this.myForm.value.codigoBarra,
            stock: this.myForm.value.stock,
            idProveedor: this.proveedor ? this.proveedor.dni : 0
          };
          this.setPrecio(producto, this.myForm.value);
          if ((this.tipoComprobante === 'ORV' || this.tipoComprobante === 'NDC') && !producto.id) {
            this.confirmarService.confirm('Error', 'Para agregar un producto nuevo hacerlo desde la Orden de Compra', true, 'Aceptar', 'Cancelar')
            .then(() => {
              this.myForm.reset();
            });
          } else {
            if (!this.productoExiste(producto.id) && this.stockValido(producto)) {
              this.productos.push(producto);
              this.myForm.reset();
            }
          }
        } else {
          this.confirmarService.confirm('Error', 'No se puede agregar. Edite el existente', true, 'Aceptar', 'Cancelar');
        }
      } catch (error:any) {
        this.confirmarService.confirm('Error', error.message, true, 'Aceptar', 'Cancelar').then(() => {
          this.myForm.reset();
        });
      }
    }
  }

  private checkeoExitoso() {
    let unicoProveedor = true;
    if (this.tipoComprobante === 'ORC') {
      unicoProveedor = this.esUnicoProveedor();
    }
    return this.productos.length > 0 && this.formaDePago.length > 0 && this.selectedFormaDePago > 0 && this.tipoComprobante && unicoProveedor;
  }

  private esUnicoProveedor(): boolean {
    if (this.productos.length === 0) {
      return true;
    }

    const idProveedorSet = new Set<number>();
    this.productos.forEach(producto => {
      if (producto.idProveedor !== undefined) {
        idProveedorSet.add(producto.idProveedor);
      }
    });

    return idProveedorSet.size <= 1;
  }

  private productoExiste(id:any) {
    if (id === null) {
      return false;
    }
    return this.productos.some(producto => producto.id === id);
  }

  private stockValido(productoNuevo:Producto) {
    if (this.tipoComprobante === 'ORV') {
      const productoExistente = this.productosProveedor.find((p) => p.id == productoNuevo.id);

      if (!productoExistente) {
        throw new Error('Producto no encontrado en el proveedor');
      }

      const stockResultante = productoExistente.stock - productoNuevo.stock;

      if (stockResultante < 0) {
        throw new Error('Stock no valido para el producto ' + productoNuevo.nombre + '. Cantidad disponible ' + productoExistente.stock);
      }

      productoExistente.stock = stockResultante;
    }
    return productoNuevo.stock > 0;
  }

  onFormaDePagoChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedFormaDePago = +target.value;
  }

  calcularTotal() {
    if (this.tipoComprobante === 'ORC') {
      return this.productos.reduce((accum, producto) => accum + ((producto.precioCompra || 0) * producto.stock), 0);
    } else if (this.tipoComprobante === 'ORV' || this.tipoComprobante === 'NDC') {
      return this.productos.reduce((accum, producto) => accum + ((producto.precioVenta || 0) * producto.stock), 0);
    }
    return 0;
  }

  getPrecioProducto(producto: Producto): any {
    if (this.tipoComprobante === 'ORC') {
      return producto.precioCompra || producto.precio;
    } else if (this.tipoComprobante === 'ORV' || this.tipoComprobante === 'NDC') {
      return producto.precioVenta || producto.precio;
    }
  }

  setPrecio(producto: Producto, value: any) {
    if (this.tipoComprobante === 'ORC') {
      producto.precioCompra = +value.precio;
    } else if (this.tipoComprobante === 'ORV' || this.tipoComprobante === 'NDC') {
      producto.precioVenta = +value.precio;
    }
  }

  eliminarProducto(producto: Producto) {
    if (this.tipoComprobante === 'ORC') {
      this.productos = this.productos.filter(p => p !== producto);
      return;
    }

    if (this.tipoComprobante === 'ORV') {
      const productoProveedor = this.productosProveedor.find(p => p.id === producto.id);
      if (productoProveedor) {
        productoProveedor.stock += producto.stock;
      }
      this.productos = this.productos.filter(p => p !== producto);
    }
  }

  editarProducto(producto: Producto) {
    this.editarItemComprobanteService.editarItem(producto).then((res => {
      if (res) {
        const stockViejo = producto.stock;
        producto.stock = res.stock;
        try {
          if (this.stockValido(producto)) {
            if (this.tipoComprobante === 'ORC') {
              producto.precioCompra = res.precio;
            } else if (this.tipoComprobante === 'ORV' || this.tipoComprobante === 'NDC') {
              producto.precioVenta = res.precio;
            }
          }
        } catch (error) {
          producto.stock = stockViejo;
        }
      }
    }));
  }

  private async obtenerNotasCreditoPendientes(dni: number): Promise<NotaCreditoPendiente[]> {
    const params = ['dniCliente=' + dni, 'tipoPedido=5', 'estado=PENDIENTE'];
    const notas = await firstValueFrom(this.pedidoService.getByParams(params));

    return notas
      .filter((nota) => !!nota.id && nota.total < 0)
      .map((nota) => ({
        idPedido: nota.id || '',
        numeroComprobante: nota.numeroComprobante || '',
        fechaCreacion: nota.fechaPedido || '',
        monto: nota.total
      } as NotaCreditoPendiente));
  }

  private async aplicarNotasCredito(notasAplicadas: NotaCreditoPendiente[], formaPago: number): Promise<void> {
    for (const nota of notasAplicadas) {
      const pago: Pago = {
        idPedido: nota.idPedido as unknown as number,
        fechaPago: nowConLuxonATimezoneArgentina(),
        valor: nota.monto,
        formaPago: 0,
        descripcion: `Uso de nota de credito ${nota.numeroComprobante}`
      };

      await firstValueFrom(this.pagosService.postPago(pago));
      await firstValueFrom(this.pedidoService.put(nota.idPedido, { estado: 'COMPLETO' } as Pedido));
    }
  }
}







