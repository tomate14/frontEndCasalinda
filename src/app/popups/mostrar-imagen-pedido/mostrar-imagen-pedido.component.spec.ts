import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MostrarImagenPedidoComponent } from './mostrar-imagen-pedido.component';

describe('MostrarImagenPedidoComponent', () => {
  let component: MostrarImagenPedidoComponent;
  let fixture: ComponentFixture<MostrarImagenPedidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MostrarImagenPedidoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MostrarImagenPedidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
