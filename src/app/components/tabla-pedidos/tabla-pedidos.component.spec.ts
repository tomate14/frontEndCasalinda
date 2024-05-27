import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaPedidoComponent } from './tabla-pedidos.component';

describe('TablaPedidoComponent', () => {
  let component: TablaPedidoComponent;
  let fixture: ComponentFixture<TablaPedidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablaPedidoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TablaPedidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
