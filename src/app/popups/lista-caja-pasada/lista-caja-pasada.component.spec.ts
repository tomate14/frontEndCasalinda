import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaCajaPasadaComponent } from './lista-caja-pasada.component';

describe('ListaCajaPasadaComponent', () => {
  let component: ListaCajaPasadaComponent;
  let fixture: ComponentFixture<ListaCajaPasadaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaCajaPasadaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListaCajaPasadaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
