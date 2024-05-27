import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficoResumenUltimoDiaComponent } from './grafico-resumen-ultimo-dia.component';

describe('GraficoResumenUltimoDiaComponent', () => {
  let component: GraficoResumenUltimoDiaComponent;
  let fixture: ComponentFixture<GraficoResumenUltimoDiaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraficoResumenUltimoDiaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GraficoResumenUltimoDiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
