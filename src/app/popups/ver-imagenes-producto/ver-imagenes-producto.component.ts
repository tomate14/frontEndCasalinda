import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Producto } from '../../../clases/dominio/producto';
import { ProductoImagen } from '../../../clases/dominio/producto-imagen';
import { ProductoService } from '../../../services/producto.service';

@Component({
  selector: 'app-ver-imagenes-producto',
  standalone: true,
  imports: [NgIf, NgFor, NgClass],
  templateUrl: './ver-imagenes-producto.component.html',
  styleUrl: './ver-imagenes-producto.component.css'
})
export class VerImagenesProductoComponent implements OnInit {
  @Input() producto: Producto | undefined;
  imagenesProducto: ProductoImagen[] = [];
  indiceImagenActual = 0;
  imagenesCargando = false;
  imagenNoDisponible = false;

  constructor(
    private activeModal: NgbActiveModal,
    private productoService: ProductoService
  ) {}

  ngOnInit(): void {
    this.cargarImagenes();
  }

  cerrar(): void {
    this.activeModal.close(false);
  }

  get tieneImagenes(): boolean {
    return this.imagenesProducto.length > 0;
  }

  get imagenActualPath(): string {
    if (!this.tieneImagenes) {
      return '';
    }
    return this.imagenesProducto[this.indiceImagenActual]?.path || '';
  }

  anteriorImagen(): void {
    if (!this.tieneImagenes) {
      return;
    }
    this.indiceImagenActual = (this.indiceImagenActual - 1 + this.imagenesProducto.length) % this.imagenesProducto.length;
    this.imagenNoDisponible = false;
  }

  siguienteImagen(): void {
    if (!this.tieneImagenes) {
      return;
    }
    this.indiceImagenActual = (this.indiceImagenActual + 1) % this.imagenesProducto.length;
    this.imagenNoDisponible = false;
  }

  irAImagen(index: number): void {
    if (index < 0 || index >= this.imagenesProducto.length) {
      return;
    }
    this.indiceImagenActual = index;
    this.imagenNoDisponible = false;
  }

  onImageError(): void {
    this.imagenNoDisponible = true;
  }

  onImageLoad(): void {
    this.imagenNoDisponible = false;
  }

  private cargarImagenes(): void {
    const idProducto = this.producto?.id;
    if (!idProducto) {
      this.imagenesProducto = [];
      return;
    }

    this.imagenesCargando = true;
    this.productoService.getProductoImagenes(idProducto).subscribe((imagenes: ProductoImagen[]) => {
      this.imagenesProducto = imagenes;
      this.indiceImagenActual = 0;
      this.imagenNoDisponible = false;
      this.imagenesCargando = false;
    }, () => {
      this.imagenesProducto = [];
      this.imagenesCargando = false;
    });
  }
}
