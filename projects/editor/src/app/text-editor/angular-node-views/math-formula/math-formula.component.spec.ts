import {
  ComponentFixture, TestBed, fakeAsync, tick
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MathFormulaNodeviewComponent } from './math-formula.component';

describe('MathFormulaNodeviewComponent', () => {
  let component: MathFormulaNodeviewComponent;
  let fixture: ComponentFixture<MathFormulaNodeviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MathFormulaNodeviewComponent, FormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(MathFormulaNodeviewComponent);
    component = fixture.componentInstance;

    // Mock Tiptap node and method
    component.node = {
      attrs: {
        formula: '\\frac{1}{2}'
      }
    } as any;
    component.updateAttributes = vi.fn();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render formula on init', () => {
    expect(component.formula).toBe('\\frac{1}{2}');
    expect(component.sanitizedFormula).toBeTruthy();
  });

  it('should toggle edit mode', fakeAsync(() => {
    expect(component.editMode).toBe(false);

    // Mock the ViewChild because detectChanges() won't update it immediately in this test setup
    component.editField = {
      nativeElement: jasmine.createSpyObj('nativeElement', ['focus'])
    } as any;

    component.toggleEditMode();
    expect(component.editMode).toBe(true);

    tick(); // for setTimeout
    expect(component.editField.nativeElement.focus).toHaveBeenCalled();
  }));

  it('should update formula and exit edit mode', fakeAsync(() => {
    component.updateFormula('\\sqrt{x}');

    expect(component.formula).toBe('\\sqrt{x}');
    expect(component.editMode).toBe(false);

    tick(); // for setTimeout in updateFormula
    expect(component.updateAttributes).toHaveBeenCalledWith(expect.objectContaining({
      formula: '\\sqrt{x}'
    }));
  }));

  it('should handle empty formula', () => {
    component.updateFormula('');
    expect(component.formula).toBe('');
    expect(component.sanitizedFormula).toBeDefined();
  });
});
