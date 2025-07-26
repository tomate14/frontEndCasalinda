import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cliente } from '../clases/dominio/cliente';
import { BACKEND_URL } from '../environments';
//import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  constructor(private httpClient: HttpClient) { }

  public getClienteByDni(dni:number): Observable<Cliente> {
      return this.httpClient.get<Cliente>(`${BACKEND_URL}/cliente/${dni}`);
  }

  public postCliente(cliente:Cliente): Observable<Cliente> {
    return this.httpClient.post<Cliente>(`${BACKEND_URL}/cliente`,cliente);
  }

  public updateCliente(idCliente: string, cliente:Cliente): Observable<Cliente> {
    return this.httpClient.put<Cliente>(`${BACKEND_URL}/cliente/${idCliente}`,cliente);
  }
  public getClientes(tipoUsuario:number): Observable<Cliente[]> {
    return this.httpClient.get<Cliente[]>(`${BACKEND_URL}/cliente?tipoUsuario=${tipoUsuario}`);
  }
}
