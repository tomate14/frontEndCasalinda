import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Pago } from '../clases/dominio/pago';
import { PagosPorPedido } from '../clases/dto/pagosPorPedido';
import { BACKEND_URL } from '../environments';
//import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class PagosService {

  constructor(private httpClient: HttpClient) { }

  public getPagoByIdPedido(idPedido:string): Observable<PagosPorPedido> {
      return this.httpClient.get<PagosPorPedido>(`${BACKEND_URL}/pago/${idPedido}`);
  }

  public postPago(pago:Pago): Observable<Pago> {
    return this.httpClient.post<Pago>(`${BACKEND_URL}/pago`,pago);    
  }
  public putPago(idPago:string, pago:Pago): Observable<Pago> {
    return this.httpClient.put<Pago>(`${BACKEND_URL}/pago/${idPago}`,pago);    
  }

  public deletePagoByIdPago(idPago:string): Observable<Pago> {
    return this.httpClient.delete<Pago>(`${BACKEND_URL}/pago/${idPago}`);
  }
  
  public getCajaByDate(fechaInicio:string, fechaFin:string): Observable<Pago[]> {
    return this.httpClient.get<Pago[]>(`${BACKEND_URL}/pago/caja/${fechaInicio}/${fechaFin}`);
  }
}