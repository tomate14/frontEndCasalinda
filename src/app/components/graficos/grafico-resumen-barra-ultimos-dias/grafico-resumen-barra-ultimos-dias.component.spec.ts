import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficoResumenBarraUltimosDiasComponent } from './grafico-resumen-barra-ultimos-dias.component';

describe('GraficoResumenBarraUltimosDiasComponent', () => {
  let component: GraficoResumenBarraUltimosDiasComponent;
  let fixture: ComponentFixture<GraficoResumenBarraUltimosDiasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraficoResumenBarraUltimosDiasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GraficoResumenBarraUltimosDiasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
