import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Pedido } from '../clases/dominio/pedido';
//import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class PedidosService {

  constructor(private httpClient: HttpClient) { }

  public getByParams(params:string[]): Observable<Pedido[]> {
      let url = `http://127.0.0.1:5000/pedido`;
      if (params.length > 0) {
        url = url + '?'+params.join("&");
      }
      return this.httpClient.get<Pedido[]>(url);
  }

  public getByIdPedido(idPedido:string): Observable<Pedido[]> {
    return this.httpClient.get<Pedido[]>(`http://127.0.0.1:5000/pedido?id=${idPedido}`);
  }

  public getByDniCliente(dni:number): Observable<Pedido[]> {
    return this.httpClient.get<Pedido[]>(`http://127.0.0.1:5000/pedido?dniCliente=${dni}`);
  }

  public post(pedido:Pedido): Observable<Pedido> {
    return this.httpClient.post<Pedido>("http://127.0.0.1:5000/pedido",pedido);
  }

  public put(idPedido:string, pedido:Pedido): Observable<Pedido> {
    return this.httpClient.put<Pedido>(`http://127.0.0.1:5000/pedido/${idPedido}`, pedido);
  }

  public getPedidosPorTipo(tipoPedido:number): Observable<Pedido[]> {
    return this.httpClient.get<Pedido[]>(`http://127.0.0.1:5000/pedido?tipoPedido=${tipoPedido}`);
  }
  public getPedidosVencidos(fechaDesde:string, tipoPedido:number): Observable<Pedido[]> {
    return this.httpClient.get<Pedido[]>(`http://127.0.0.1:5000/pedido/pedidos-vencidos/${fechaDesde}/${tipoPedido}`);
  }
}
