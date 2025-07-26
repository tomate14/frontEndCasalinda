import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Caja } from '../clases/dominio/caja';
import { BACKEND_URL } from '../environments';

@Injectable({
  providedIn: 'root'
})
export class CajaService {

  constructor(private httpClient: HttpClient) { }

  public getCajaByFecha(fechaInicio:string,fechaFin:string): Observable<any> {
    return this.httpClient.get<any>(`${BACKEND_URL}/caja/${fechaInicio}/${fechaFin}`);
  }
  public getUltimasCajasCerradas() :Observable<string> {
    return this.httpClient.get<any>(`${BACKEND_URL}/caja/ultima-cerrada`);
  }

  public cierreCaja(fechaInicio:string,fechaFin:string): Observable<any> {
    return this.httpClient.get<any>(`${BACKEND_URL}/caja-cierre/${fechaInicio}/${fechaFin}`);
  }

  public postCliente(caja:Caja): Observable<Caja> {
    return this.httpClient.post<Caja>("${BACKEND_URL}/caja",caja);
  }
}
