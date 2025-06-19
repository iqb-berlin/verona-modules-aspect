import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintLabelComponent } from './print-label.component';

describe('PrintLabelComponent', () => {
  let component: PrintLabelComponent;
  let fixture: ComponentFixture<PrintLabelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrintLabelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrintLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
