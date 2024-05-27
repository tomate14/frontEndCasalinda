import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficoHistogramaComponent } from './grafico-histograma.component';

describe('GraficoHistogramaComponent', () => {
  let component: GraficoHistogramaComponent;
  let fixture: ComponentFixture<GraficoHistogramaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraficoHistogramaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GraficoHistogramaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
