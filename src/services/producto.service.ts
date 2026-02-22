import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Producto } from '../clases/dominio/producto';
import { ProductoImagen } from '../clases/dominio/producto-imagen';
import { BACKEND_URL } from '../environments';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  saveAll(productos: Producto[]) {
    return this.httpClient.post<Producto[]>(`${BACKEND_URL}/producto`,productos);
  }

  constructor(private httpClient: HttpClient) { }

  public getProductoById(id:number): Observable<Producto> {
      return this.httpClient.get<Producto>(`${BACKEND_URL}/producto?id=${id}`);
  }

  public getProductoByIdPedido(idPedido:number): Observable<Producto[]> {
    return this.httpClient.get<Producto[]>(`${BACKEND_URL}/producto/detalle/${idPedido}`);
  }

  public getByParams(params:string[]): Observable<Producto[]> {
    let url = `${BACKEND_URL}/producto`;
    if (params.length > 0) {
      url = url + '?'+params.join("&");
    }
    return this.httpClient.get<Producto[]>(url);
    }

  public crearProdcuto(producto:Producto): Observable<Producto> {
    return this.httpClient.post<Producto>(`${BACKEND_URL}/producto`,producto);    
  }

  public updateProducto(producto:Producto): Observable<Producto> {
    return this.httpClient.put<Producto>(`${BACKEND_URL}/producto`,producto);    
  }

  public getProductoImagenes(idProducto:number): Observable<ProductoImagen[]> {
    return this.httpClient.get<ProductoImagen[]>(`${BACKEND_URL}/producto/${idProducto}/imagenes`);
  }

  public uploadProductoImagenes(idProducto:number, files: File[]): Observable<ProductoImagen[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return this.httpClient.post<ProductoImagen[]>(`${BACKEND_URL}/producto/${idProducto}/imagenes`, formData);
  }
  
  public getCodigoBarraPDF(idProducto:number, cantidad:number = 20): Observable<Blob> {
    return this.httpClient.get(`${BACKEND_URL}/producto/codigo-barra/pdf?idProducto=${idProducto}&cantidad=${cantidad}`, {
        responseType: 'blob',
    });
  }
}
