import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cliente } from '../clases/dominio/cliente';
//import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  constructor(private httpClient: HttpClient) { }

  public getClienteByDni(dni:number): Observable<Cliente> {
      return this.httpClient.get<Cliente>(`http://127.0.0.1:5000/cliente/${dni}`);
  }

  public postCliente(cliente:Cliente): Observable<Cliente> {
    return this.httpClient.post<Cliente>("http://127.0.0.1:5000/cliente",cliente);    
  }

  public updateCliente(idCliente: string, cliente:Cliente): Observable<Cliente> {
    return this.httpClient.put<Cliente>(`http://127.0.0.1:5000/cliente/${idCliente}`,cliente);    
  }
  public getClientes(): Observable<Cliente[]> {
    return this.httpClient.get<Cliente[]>(`http://127.0.0.1:5000/cliente`);
  }
}
