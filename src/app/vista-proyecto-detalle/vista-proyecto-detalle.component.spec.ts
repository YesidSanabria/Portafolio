import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VistaProyectoDetalleComponent } from './vista-proyecto-detalle.component';

describe('VistaProyectoDetalleComponent', () => {
  let component: VistaProyectoDetalleComponent;
  let fixture: ComponentFixture<VistaProyectoDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VistaProyectoDetalleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VistaProyectoDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
