import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Caja } from '../clases/dominio/caja';

@Injectable({
  providedIn: 'root'
})
export class ExportPDFService {

  constructor(private httpClient: HttpClient) { }

  public getDocumentoPDF(idPedido:string): any {
    return this.httpClient.get(`http://127.0.0.1:8080/informes?idPedido=${idPedido}`, {
        responseType: 'blob', // Especificar que la respuesta es un Blob
    });
  }
}