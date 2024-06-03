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

  public get(): Observable<Pedido[]> {
      return this.httpClient.get<Pedido[]>(`http://127.0.0.1:5000/pedido`);
  }

  public getByIdPedido(idPedido:string): Observable<Pedido[]> {
    return this.httpClient.get<Pedido[]>(`http://127.0.0.1:5000/pedido/${idPedido}`);
  }

  public getByDniCliente(dni:number): Observable<Pedido[]> {
    return this.httpClient.get<Pedido[]>(`http://127.0.0.1:5000/pedido/${dni}`);
  }

  public post(pedido:Pedido): Observable<Pedido> {
    return this.httpClient.post<Pedido>("http://127.0.0.1:5000/pedido",pedido);
  }

  public put(idPedido:string, pedido:Pedido): Observable<Pedido> {
    return this.httpClient.put<Pedido>(`http://127.0.0.1:5000/pedido/${idPedido}`, pedido);
  }

  public getPedidosPorTipo(tipoPedido:number): Observable<Pedido[]> {
    return this.httpClient.get<Pedido[]>(`http://127.0.0.1:5000/pedido/tipo-pedido/${tipoPedido}`);
  }
  public getPedidosVencidos(fechaDesde:string, tipoPedido:number): Observable<Pedido[]> {
    return this.httpClient.get<Pedido[]>(`http://127.0.0.1:5000/pedido/pedidos-vencidos/${fechaDesde}/${tipoPedido}`);
  }
}
