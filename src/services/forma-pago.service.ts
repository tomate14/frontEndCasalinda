import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { FormaDePago } from '../clases/constantes/formaPago';
import { BACKEND_URL } from '../environments';

interface FormaPagoResponse {
  id: number;
  nombre: string;
  descripcion: string;
}

@Injectable({
  providedIn: 'root'
})
export class FormaPagoService {
  constructor(private httpClient: HttpClient) {}

  public getFormasPagoDropdown(): Observable<FormaDePago[]> {
    return this.httpClient.get<FormaPagoResponse[]>(`${BACKEND_URL}/forma-pago`).pipe(
      map((formasPago) =>
        formasPago
          .filter((formaPago) => formaPago.id > 0)
          .map((formaPago) => ({
            value: formaPago.id,
            viewValue: formaPago.nombre
          }))
      )
    );
  }
}
