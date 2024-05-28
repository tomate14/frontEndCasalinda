import { Component, OnInit } from '@angular/core';
import { Cliente } from '../../../clases/dominio/cliente';
import { ClienteService } from '../../../services/cliente.service';
import { NgFor, NgIf } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CrearClienteService } from '../../../services/popup/crearCliente.service';
import { PedidosService } from '../../../services/pedidos.service';
import { ListarPedidosService } from '../../../services/popup/listarPedidos.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-tabla-clientes',
  standalone: true,
  imports: [NgFor, NgbModule, NgIf, ReactiveFormsModule, FormsModule, NgxPaginationModule ],
  templateUrl: './tabla-clientes.component.html',
  styleUrl: './tabla-clientes.component.css'
})
export class TablaClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  filterForm: FormGroup;
  isCollapsed: boolean = true;
  p: number = 1;
  constructor(private fb: FormBuilder, private clientesService: ClienteService, private pedidosService: PedidosService, private crearClienteService: CrearClienteService, private listaPedidosService: ListarPedidosService) {
    this.filterForm = this.fb.group({
      dniCliente: [''],
      nombre: ['']
    });
  }

  ngOnInit(): void {
    this.clientesService.getClientes().subscribe((data: Cliente[]) => {
        this.clientes = data;
      },(error) => {
        console.error('Error al obtener los datos de los clientes', error);
      }
    );
  }

  crearCliente(): void {
    const cliente = undefined;
    this.crearClienteService.crearCliente(cliente)
    .then((cliente) => {
        if(cliente){
          this.clientes.push(cliente);
        }
    });
  }

  verPedidos(cliente: Cliente): void {
    this.pedidosService.getByDniCliente(cliente.dni).subscribe((res) => {
      this.listaPedidosService.crearLista(cliente.dni, res).then((confirmed) => {
        if(confirmed){
          alert("Listado")
        }
      });
      // Lógica para ver detalles del cliente
      console.log('Pedidos por cliente:', res);
    })    
  }
  editarCliente(cliente:Cliente) {
    this.crearClienteService.crearCliente(cliente)
    .then((cliente:Cliente)  => {
      if (cliente) {
        const index = this.clientes.findIndex(c => c.dni === cliente.dni);
        if (index !== -1) {
            this.clientes[index] = cliente;
        }
    }
    });
  }

  buscar() {
    const { dniCliente, nombre } = this.filterForm.value;
    this.clientes = this.clientes.filter((cliente: Cliente) => {
      const matchesDniCliente = dniCliente ? cliente.dni === +dniCliente : true;
      const matchesNombre = nombre ? cliente.nombre?.toLowerCase().includes(nombre.toLowerCase()) : true;

      return matchesDniCliente && matchesNombre;
    });
  }
  limpiar() {
    this.filterForm.reset();
    this.clientesService.getClientes().subscribe(
      (data: Cliente[]) => {
        this.clientes = data;
      },
      (error) => {
        alert('Error al obtener los productos '+error);
      }
    );
  }
}