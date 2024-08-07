import { Component, OnInit } from '@angular/core';
import { Cliente } from '../../../clases/dominio/cliente';
import { ClienteService } from '../../../services/cliente.service';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CrearClienteService } from '../../../services/popup/crearCliente.service';
import { PedidosService } from '../../../services/pedidos.service';
import { ListarPedidosService } from '../../../services/popup/listarPedidos.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ConfirmarService } from '../../../services/popup/confirmar';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-tabla-clientes',
  standalone: true,
  imports: [NgFor, NgbModule, NgIf, ReactiveFormsModule, FormsModule, NgxPaginationModule, NgClass ],
  templateUrl: './tabla-clientes.component.html',
  styleUrl: './tabla-clientes.component.css'
})
export class TablaClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  filterForm: FormGroup;
  isCollapsed: boolean = true;
  tipoUsuario:number= 1;
  p: number = 1;
  constructor(private route: ActivatedRoute, private fb: FormBuilder, private clientesService: ClienteService, private pedidosService: PedidosService, 
    private crearClienteService: CrearClienteService, private listaPedidosService: ListarPedidosService, private confirmarService:ConfirmarService) {
    this.filterForm = this.fb.group({
      dniCliente: [''],
      nombre: [''],
      opciones:null
    });
    this.route.params.subscribe(params => {
      this.tipoUsuario = +params['id']; // El + convierte el string a number
    });
  }

  ngOnInit(): void {
    this.clientesService.getClientes(this.tipoUsuario).subscribe((data: Cliente[]) => {
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
          this.limpiar();
        }
    });
  }

  verPedidos(cliente: Cliente): void {
    this.pedidosService.getByDniCliente(cliente.dni).subscribe((res) => {
      this.listaPedidosService.crearLista(cliente.dni, res).then((confirmed) => {
        if(confirmed){
          console.log("Listado")
        }
      });
      // Lógica para ver detalles del cliente
      console.log('Pedidos por cliente:', res);
    }, (error) => {
      this.confirmarService.confirm("Cliente sin pedidos", error.error.message, true,"Ok", "No");
    })    
  }
  editarCliente(cliente:Cliente) {
    this.crearClienteService.crearCliente(cliente)
    .then((cliente:Cliente)  => {
      if (cliente) {
        this.limpiar();
      }
    });
  }

  buscar() {
    const { dniCliente, nombre, opciones } = this.filterForm.value;
    this.clientes = this.clientes.filter((cliente: Cliente) => {
      const matchesDniCliente = dniCliente ? cliente.dni === +dniCliente : true;
      const matchesNombre = nombre ? cliente.nombre?.toLowerCase().includes(nombre.toLowerCase()) : true;
      const matchesDeudor = opciones === '1' ? cliente.esDeudor : true;
      const matchesNoDeudor = opciones === '2' ? !cliente.esDeudor : true;

      return matchesDniCliente && matchesNombre && matchesDeudor && matchesNoDeudor;
    });
  }
  limpiar() {
    this.filterForm.reset();
    this.clientesService.getClientes(this.tipoUsuario).subscribe(
      (data: Cliente[]) => {
        this.clientes = data;
      },
      (error) => {
        alert('Error al obtener los productos '+error.error.message);
      }
    );
  }
  verClientesDeudores() {

  }
}