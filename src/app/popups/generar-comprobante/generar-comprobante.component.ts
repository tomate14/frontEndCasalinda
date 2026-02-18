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
import { FormaDePago, formaDePago } from '../../../clases/constantes/formaPago';
import { ConfirmarComprobanteService } from '../../../services/popup/confirmarComprobante.setvice';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TipoPedido, tipoDePedido } from '../../../clases/constantes/cuentaCorriente';
import { Pedido } from '../../../clases/dominio/pedido';
import { EditarItemComprobanteService } from '../../../services/popup/editarItemComprobante.service';

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
  selectedFormaDePago:number = 1;
  tipoDePedido:TipoPedido[] = [];
  @Input() readonly:boolean = false;
  @Input() pedido:Pedido | undefined;
  @Input() title:string = "";
  @Input() tipoComprobante:string = "";
  @ViewChild(SearchableSelectComponent)
  proveedorSelect!: SearchableSelectComponent;
  constructor(private route: ActivatedRoute, private clienteService: ClienteService, private fb: FormBuilder,
    private productoService:ProductoService, private confirmarService:ConfirmarService, private pedidoService: PedidosService,
    private confirmarComprobanteService: ConfirmarComprobanteService, private activeModal: NgbActiveModal,
    private editarItemComprobanteService: EditarItemComprobanteService
  ) {
    this.formaDePago = formaDePago;
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
      formaDePago: 1
    });
  }
  ngOnInit(): void {
    if (this.readonly && this.pedido && this.pedido.id) {
      const id = +this.pedido.id;
      this.productoService.getProductoByIdPedido(id).subscribe(res => {
        this.productos = res;
      })
    } else {
      if (this.tipoComprobante === 'ORC') {
        this.tipoUsuario = 2;
        this.clienteService.getClientes(this.tipoUsuario).subscribe(res => {
          this.usuarios = res;
        })
      } else /*if (this.tipoComprobante === 'ORV')*/ {
        this.tipoUsuario = 0;
        this.productoService.getByParams([]).subscribe(res => {
          this.productosProveedor = res;
        })
      }
    }
  }
  validSelection(cliente: Cliente) {
    return this.proveedor && this.tipoComprobante === 'ORC' && this.productos.length > 0 && this.proveedor.dni !== cliente.dni
  }
  onProveedorSelect(cliente: Cliente) {
    console.log(cliente);
    if (cliente) {
      if (this.validSelection(cliente)) {
        this.confirmarService.confirm('Error', 'El proveedor debe ser unico para las Ordenes de Compra', true, 'Aceptar', 'Cancelar');
        this.proveedorSelect.setValue(this.proveedor?.dni);
      } else {
        this.proveedor = cliente;
        const filtro = `idProveedor=${this.proveedor.dni}`;
        this.productoService.getByParams([filtro]).subscribe((res:Producto[]) =>{
          this.productosProveedor = res;
        })
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
    //this.readonly = true;
  }
  onSubmitHeader() {
    if (this.myFormHeader.valid) {
      const total = this.calcularTotal();
      const tipoComprobante = this.tipoComprobante || "";
      const dni = this.myFormHeader.value.dni || 0;
      try {
        if (this.checkeoExitoso()) {
          this.confirmarComprobanteService.confirm(total, this.tipoComprobante, this.formaDePago).then((res)=> {
            if (res) {
              this.pedidoService.crearPedido(this.productos, tipoComprobante, res.formaDePago, total, res.dni).subscribe((res:any)=> {
                console.log(res);
                this.productos = [];
                this.productosProveedor = [];
                this.activeModal.close(res);
                //this.readonly = false;
              }, (error) => {
                this.confirmarService.confirm('Error', error.error.message, true, 'Aceptar', 'Cancelar');
              })
            }
          })
          
        }
      } catch (error) {
        this.confirmarService.confirm('Error', JSON.stringify(error), true, 'Aceptar', 'Cancelar');
      }
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
          }
          this.setPrecio(producto, this.myForm.value);
          // Ordenes de ventas no habilitadas para dar de alta productos. Solo hacer por ORDEN DE COMPRA
          // para agregar el stock correspondiente.
          if ((this.tipoComprobante === 'ORV' || this.tipoComprobante === 'NDC') && !producto.id) {
            this.confirmarService.confirm('Error', 'Para agregar un producto nuevo hacerlo desde la Orden de Compra', true, 'Aceptar', 'Cancelar')
            .then((res)=> {
              this.myForm.reset();
            });
          } else {
            if (!this.productoExiste(producto.id) && this.stockValido(producto)) {
              this.productos.push(producto);
              this.myForm.reset();
            }
          }
          //this.readonly = false;
        } else {
          this.confirmarService.confirm('Error', 'No se puede agregar. Edite el existente', true, 'Aceptar', 'Cancelar');
        }  
      } catch (error:any) {
        this.confirmarService.confirm('Error', error.message, true, 'Aceptar', 'Cancelar').then((res) => {
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
    return this.productos.length > 0 && this.selectedFormaDePago > 0 && this.tipoComprobante && unicoProveedor;
  }

  private esUnicoProveedor(): boolean {
    if (this.productos.length === 0) {
      return true; // No hay productos, se considera único
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
      return false; // Si el ID es null, no hacemos la validación
    }
    return this.productos.some(producto => producto.id === id);
  }

  private stockValido(productoNuevo:Producto) {
    if (this.tipoComprobante === 'ORV') {
       const productoExistente = this.productosProveedor
      .find((p) => p.id == productoNuevo.id);

      if (!productoExistente) {
        throw new Error('Producto no encontrado en el proveedor');
      }

      const stockResultante = productoExistente.stock - productoNuevo.stock;

      if (stockResultante < 0) {
        throw new Error(
          'Stock no valido para el producto ' +
          productoNuevo.nombre +
          '. Cantidad disponible ' +
          productoExistente.stock
        );
      }

      // 🔥 ACA DESCONTAMOS EL STOCK REAL
      productoExistente.stock = stockResultante;
    }
    return productoNuevo.stock > 0;
  }
  onFormaDePagoChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedFormaDePago = +target.value;
    console.log('Forma de pago seleccionada:', this.selectedFormaDePago);
  }

  calcularTotal() {
    if (this.tipoComprobante === 'ORC') {
      return this.productos.reduce((accum, producto) => accum + ((producto.precioCompra || 0) * producto.stock), 0);
    } else if (this.tipoComprobante === 'ORV' || this.tipoComprobante === 'NDC') {
      return this.productos.reduce((accum, producto) => accum + ((producto.precioVenta || 0) * producto.stock), 0);
    } else {
      return 0;
    }
    
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

      // 🔥 En ORC se elimina sin validar nada
      this.productos = this.productos.filter(p => p !== producto);
      return;
    }

    if (this.tipoComprobante === 'ORV') {

      // 🔥 Restaurar stock al listado original
      const productoProveedor = this.productosProveedor
        .find(p => p.id === producto.id);

      if (productoProveedor) {
        productoProveedor.stock += producto.stock;
      }

      // 🔥 Eliminar del comprobante
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
}



