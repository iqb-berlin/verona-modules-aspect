import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrintElementComponent } from 'player/modules/print/components/print-element/print-element.component';

describe('PrintElementComponent', () => {
  let component: PrintElementComponent;
  let fixture: ComponentFixture<PrintElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        PrintElementComponent
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
