import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StockFaltanteResumen } from '../clases/dto/stockFaltanteResumen';
import { BACKEND_URL } from '../environments';

@Injectable({
  providedIn: 'root'
})
export class StockFaltanteService {

  constructor(private httpClient: HttpClient) { }

  public getListadoStockFaltante(page: number, size: number, fechaReferencia: string, estrategia: string): Observable<StockFaltanteResumen> {
    // Se envian filtros minimos para mantener el endpoint simple y reutilizable.
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('fechaReferencia', fechaReferencia)
      .set('estrategia', estrategia);

    return this.httpClient.get<StockFaltanteResumen>(`${BACKEND_URL}/stock-faltante/listado`, { params });
  }
}
