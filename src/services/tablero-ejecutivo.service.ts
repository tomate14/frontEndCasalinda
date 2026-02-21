import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TableroEjecutivoDiario } from '../clases/dto/tableroEjecutivoDiario';
import { BACKEND_URL } from '../environments';

@Injectable({
  providedIn: 'root'
})
export class TableroEjecutivoService {

  constructor(private httpClient: HttpClient) { }

  public getResumenDiario(fecha?: string): Observable<TableroEjecutivoDiario> {
    let params = new HttpParams();
    if (fecha) {
      params = params.set('fecha', fecha);
    }
    return this.httpClient.get<TableroEjecutivoDiario>(`${BACKEND_URL}/tablero-ejecutivo/diario`, { params });
  }
}

