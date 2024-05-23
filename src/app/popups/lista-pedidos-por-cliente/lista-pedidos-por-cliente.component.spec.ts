import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaPedidosPorClienteComponent } from './lista-pedidos-por-cliente.component';

describe('ListaPedidosPorClienteComponent', () => {
  let component: ListaPedidosPorClienteComponent;
  let fixture: ComponentFixture<ListaPedidosPorClienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaPedidosPorClienteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListaPedidosPorClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
