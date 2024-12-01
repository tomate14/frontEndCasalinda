import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Pedido } from '../clases/dominio/pedido';
import { DeudaPedido } from '../clases/dto/deudaPedido';
import { BACKEND_URL } from '../environments';
//import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class PedidosService {

  constructor(private httpClient: HttpClient) { }

  public getByParams(params:string[]): Observable<Pedido[]> {
      let url = `${BACKEND_URL}/pedido`;
      if (params.length > 0) {
        url = url + '?'+params.join("&");
      }
      return this.httpClient.get<Pedido[]>(url);
  }

  public getByIdPedido(idPedido:string): Observable<Pedido[]> {
    return this.httpClient.get<Pedido[]>(`${BACKEND_URL}/pedido?id=${idPedido}`);
  }

  public getByDniCliente(dni:number): Observable<Pedido[]> {
    return this.httpClient.get<Pedido[]>(`${BACKEND_URL}/pedido?dniCliente=${dni}`);
  }

  public post(pedido:Pedido): Observable<Pedido> {
    return this.httpClient.post<Pedido>(`${BACKEND_URL}/pedido`,pedido);
  }

  public put(idPedido:string, pedido:Pedido): Observable<Pedido> {
    return this.httpClient.put<Pedido>(`${BACKEND_URL}/pedido/${idPedido}`, pedido);
  }

  public getPedidosPorTipo(tipoPedido:number): Observable<Pedido[]> {
    return this.httpClient.get<Pedido[]>(`${BACKEND_URL}/pedido?tipoPedido=${tipoPedido}`);
  }
  public getPedidosVencidos(fechaDesde:string, tipoPedido:number): Observable<Pedido[]> {
    return this.httpClient.get<Pedido[]>(`${BACKEND_URL}/pedido/pedidos-vencidos/${fechaDesde}/${tipoPedido}`);
  }

  public getInformeDeudaPedido(idPedido: string): Observable<DeudaPedido> {
    return this.httpClient.get<DeudaPedido>(`${BACKEND_URL}/pedido/informe-deuda?id=${idPedido}`);
  }
}
