import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Caja } from '../clases/dominio/caja';

@Injectable({
  providedIn: 'root'
})
export class CajaService {

  constructor(private httpClient: HttpClient) { }

  public getCajaByFecha(fecha:string): Observable<Caja> {
      return this.httpClient.get<Caja>(`http://127.0.0.1:5000/caja/${fecha}`);
  }

  public postCliente(caja:Caja): Observable<Caja> {
    return this.httpClient.post<Caja>("http://127.0.0.1:5000/caja",caja);    
  }
}