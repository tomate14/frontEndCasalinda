import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaCajaComponent } from './tabla-caja.component';

describe('TablaCajaComponent', () => {
  let component: TablaCajaComponent;
  let fixture: ComponentFixture<TablaCajaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablaCajaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TablaCajaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
