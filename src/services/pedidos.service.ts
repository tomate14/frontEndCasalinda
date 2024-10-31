import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Pedido } from '../clases/dominio/pedido';
import { DeudaPedido } from '../clases/dto/deudaPedido';
import { Producto } from '../clases/dominio/producto';
//import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class PedidosService {

  constructor(private httpClient: HttpClient) { }

  public getByParams(params:string[]): Observable<Pedido[]> {
      let url = `http://127.0.0.1:8080/pedido`;
      if (params.length > 0) {
        url = url + '?'+params.join("&");
      }
      return this.httpClient.get<Pedido[]>(url);
  }

  public getByIdPedido(idPedido:string): Observable<Pedido[]> {
    return this.httpClient.get<Pedido[]>(`http://127.0.0.1:8080/pedido?id=${idPedido}`);
  }

  public getByDniCliente(dni:number): Observable<Pedido[]> {
    return this.httpClient.get<Pedido[]>(`http://127.0.0.1:8080/pedido?dniCliente=${dni}`);
  }

  public post(pedido:Pedido): Observable<Pedido> {
    return this.httpClient.post<Pedido>("http://127.0.0.1:8080/pedido",pedido);
  }

  public crearPedido(productos:Producto[], tipoComprobante:string, formaPago:number, total:number, dni?:number): Observable<Pedido> {
    const pedidoDto = {
      productos,
      tipoComprobante,
      formaPago,
      total,
      dni
    }
    return this.httpClient.post<Pedido>("http://127.0.0.1:8080/pedido/crear",pedidoDto);
  }

  public put(idPedido:string, pedido:Pedido): Observable<Pedido> {
    return this.httpClient.put<Pedido>(`http://127.0.0.1:8080/pedido/${idPedido}`, pedido);
  }

  public getPedidosPorTipo(tipoPedido:number): Observable<Pedido[]> {
    return this.httpClient.get<Pedido[]>(`http://127.0.0.1:8080/pedido?tipoPedido=${tipoPedido}`);
  }
  public getPedidosVencidos(fechaDesde:string, tipoPedido:number): Observable<Pedido[]> {
    return this.httpClient.get<Pedido[]>(`http://127.0.0.1:8080/pedido/pedidos-vencidos/${fechaDesde}/${tipoPedido}`);
  }

  public getInformeDeudaPedido(idPedido: string): Observable<DeudaPedido> {
    return this.httpClient.get<DeudaPedido>(`http://127.0.0.1:8080/pedido/informe-deuda?id=${idPedido}`);
  }
}
