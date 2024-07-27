import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Caja } from '../clases/dominio/caja';

@Injectable({
  providedIn: 'root'
})
export class CajaService {

  constructor(private httpClient: HttpClient) { }

  public getCajaByFecha(fechaInicio:string,fechaFin:string): Observable<any> {
    return this.httpClient.get<any>(`http://127.0.0.1:8080/caja/${fechaInicio}/${fechaFin}`);
  }
  public getUltimasCajasCerradas() :Observable<any> {
    return this.httpClient.get<any>(`http://127.0.0.1:8080/caja/ultima-cerrada`);
  }

  public cierreCaja(fechaInicio:string,fechaFin:string): Observable<any> {
    return this.httpClient.get<any>(`http://127.0.0.1:8080/caja/caja-cierre/${fechaInicio}/${fechaFin}`);
  }

  public postCliente(caja:Caja): Observable<Caja> {
    return this.httpClient.post<Caja>("http://127.0.0.1:8080/caja",caja);    
  }
}