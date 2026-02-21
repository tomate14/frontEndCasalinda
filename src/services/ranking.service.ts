import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RankingResumen } from '../clases/dto/rankingResumen';
import { BACKEND_URL } from '../environments';

@Injectable({
  providedIn: 'root'
})
export class RankingService {

  constructor(private httpClient: HttpClient) { }

  public getResumenRanking(fechaDesde: string, fechaHasta: string, topN: number, criterioProductos: 'cantidad' | 'facturacion'): Observable<RankingResumen> {
    const params = new HttpParams()
      .set('fechaDesde', fechaDesde)
      .set('fechaHasta', fechaHasta)
      .set('topN', topN)
      .set('criterioProductos', criterioProductos);

    return this.httpClient.get<RankingResumen>(`${BACKEND_URL}/ranking/resumen`, { params });
  }
}

