import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmarComprobanteComponent } from './confirmar-comprobante.component';

describe('ConfirmarComprobanteComponent', () => {
  let component: ConfirmarComprobanteComponent;
  let fixture: ComponentFixture<ConfirmarComprobanteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmarComprobanteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfirmarComprobanteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
