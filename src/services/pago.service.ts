import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Pago } from '../clases/dominio/pago';
//import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class PagosService {

  constructor(private httpClient: HttpClient) { }

  public getPagoByIdPedido(idPedido:string): Observable<Pago[]> {
      return this.httpClient.get<Pago[]>(`http://127.0.0.1:5000/pago/${idPedido}`);
  }

  public postPago(pago:Pago): Observable<Pago> {
    return this.httpClient.post<Pago>("http://127.0.0.1:5000/pago",pago);    
  }

  public deletePagoByIdPago(idPago:string): Observable<Pago> {
    return this.httpClient.delete<Pago>(`http://127.0.0.1:5000/pago/${idPago}`);
  }
}