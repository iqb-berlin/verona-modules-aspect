import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrintSectionComponent } from 'player/modules/print/components/print-section/print-section.component';

describe('PrintSectionComponent', () => {
  let component: PrintSectionComponent;
  let fixture: ComponentFixture<PrintSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        PrintSectionComponent
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintSectionComponent);
    component = fixture.componentInstance;
    component.pages = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
