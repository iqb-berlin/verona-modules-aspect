import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrintPageComponent } from 'player/modules/print/components/print-page/print-page.component';

describe('PrintLayoutComponent', () => {
  let component: PrintPageComponent;
  let fixture: ComponentFixture<PrintPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        PrintPageComponent
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
