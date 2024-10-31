import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarItemComprobanteComponent } from './editar-item-comprobante.component';

describe('EditarItemComprobanteComponent', () => {
  let component: EditarItemComprobanteComponent;
  let fixture: ComponentFixture<EditarItemComprobanteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarItemComprobanteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditarItemComprobanteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
