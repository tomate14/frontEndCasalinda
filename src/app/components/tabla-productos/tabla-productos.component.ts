import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Producto } from '../../../clases/dominio/producto';
import { ConfirmarService } from '../../../services/popup/confirmar';
import { CurrencyPipe, NgClass, NgFor, NgIf, registerLocaleData } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { ProductoService } from '../../../services/producto.service';

import localeEsAr from '@angular/common/locales/es-AR';
import localeEsArExtra from '@angular/common/locales/extra/es-AR';
import { CrearProductoService } from '../../../services/popup/crearProducto.service';
registerLocaleData(localeEsAr, 'es-AR', localeEsArExtra);
@Component({
  selector: 'app-tabla-productos',
  standalone: true,
  imports: [NgFor, NgbModule, NgIf, ReactiveFormsModule, FormsModule, NgxPaginationModule, NgClass, CurrencyPipe],
  templateUrl: './tabla-productos.component.html',
  styleUrl: './tabla-productos.component.css'
})
export class TablaProductoComponent {

  productos: Producto[] = [];
  filterForm: FormGroup;
  isCollapsed: boolean = true;
  tipoUsuario:number= 1;
  p: number = 1;
  constructor(private route: ActivatedRoute, private fb: FormBuilder, private productosService: ProductoService,
    private crearProductoService: CrearProductoService, private confirmarService:ConfirmarService) {
    this.filterForm = this.fb.group({
      id: [''],
      nombre: ['']
    });
  }

  ngOnInit(): void {
    this.productosService.getByParams([]).subscribe((data: Producto[]) => {
        this.productos = data;
      },(error) => {
        console.error('Error al obtener los datos de los productos', error);
      }
    );
  }

  imprimirComprobante(producto: Producto) {
    if (producto.id) {
      this.productosService.getCodigoBarraPDF(producto.id).subscribe((res: any) => {
        const url = window.URL.createObjectURL(res);
        const newWindow = window.open();

        const rows = 4; // Número de filas de imágenes
        const cols = 4; // Número de columnas de imágenes

        let content = `<html><head><style>
          body { margin: 0; }
          .grid { display: grid; grid-template-columns: repeat(${cols}, 1fr); grid-gap: 10px; }
          img { width: 100%; height: auto; }
        </style></head><body>`;
        
        content += '<div class="grid">';
        for (let i = 0; i < rows * cols; i++) {
          content += `<div><img src="${url}" alt="Código de Barras" /></div>`;
        }
        content += '</div></body></html>';

        newWindow?.document.write(content);
        newWindow?.document.close();
      })
    }
  }

  editarProducto(producto:Producto) {
    this.crearProductoService.abrirProducto(producto)
    .then((producto:Producto)  => {
      if (producto) {
        this.limpiar();
      }
    });
  }

  buscar() {
    const { id, nombre } = this.filterForm.value;
    let params = [];
    if (id) {
      params.push("id="+id);
    }
    if (nombre) {
      params.push("nombre="+nombre);
    }

    this.productosService.getByParams(params).subscribe((res) => {
      this.productos = res;
    }, (error) => {
      this.productos = []
    });
  }
  limpiar() {
    this.filterForm.reset();
    this.productosService.getByParams([]).subscribe(
      (data: Producto[]) => {
        this.productos = data;
      },
      (error) => {
        this.confirmarService.confirm('Error', error.error.message, true, 'Aceptar', '');
      }
    );
  }
}
