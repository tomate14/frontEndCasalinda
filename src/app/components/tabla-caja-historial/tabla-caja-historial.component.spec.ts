import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaCajaHistorialComponent } from './tabla-caja-historial.component';

describe('TablaCajaHistorialComponent', () => {
  let component: TablaCajaHistorialComponent;
  let fixture: ComponentFixture<TablaCajaHistorialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablaCajaHistorialComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TablaCajaHistorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
