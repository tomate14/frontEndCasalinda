import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaPagosPorPedidoComponent } from './lista-pagos-por-pedido.component';

describe('ListaPagosPorPedidoComponent', () => {
  let component: ListaPagosPorPedidoComponent;
  let fixture: ComponentFixture<ListaPagosPorPedidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaPagosPorPedidoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListaPagosPorPedidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
