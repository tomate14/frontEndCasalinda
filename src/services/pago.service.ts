import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Pago } from '../clases/dominio/pago';
import { PagosPorPedido } from '../clases/dto/pagosPorPedido';
//import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class PagosService {

  constructor(private httpClient: HttpClient) { }

  public getPagoByIdPedido(idPedido:string): Observable<PagosPorPedido> {
      return this.httpClient.get<PagosPorPedido>(`http://127.0.0.1:5000/pago/${idPedido}`);
  }

  public postPago(pago:Pago): Observable<Pago> {
    return this.httpClient.post<Pago>("http://127.0.0.1:5000/pago",pago);    
  }
  public putPago(idPago:string, pago:Pago): Observable<Pago> {
    return this.httpClient.put<Pago>(`http://127.0.0.1:5000/pago/${idPago}`,pago);    
  }

  public deletePagoByIdPago(idPago:string): Observable<Pago> {
    return this.httpClient.delete<Pago>(`http://127.0.0.1:5000/pago/${idPago}`);
  }
  
  public getCajaByDate(fechaInicio:string, fechaFin:string): Observable<Pago[]> {
    return this.httpClient.get<Pago[]>(`http://127.0.0.1:5000/pago/caja/${fechaInicio}/${fechaFin}`);
  }
}