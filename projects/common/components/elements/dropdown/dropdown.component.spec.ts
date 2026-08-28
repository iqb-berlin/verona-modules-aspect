import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DropdownElement, DropdownProperties } from 'common/models/elements/dropdown';
import { SafeResourceHTMLPipe } from 'common/pipes/safe-resource-html.pipe';
import { DropdownComponent } from './dropdown.component';

describe('DropdownComponent', () => {
  let component: DropdownComponent;
  let fixture: ComponentFixture<DropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DropdownComponent, SafeResourceHTMLPipe],
      imports: [
        ReactiveFormsModule,
        MatSelectModule,
        MatFormFieldModule
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DropdownComponent);
    component = fixture.componentInstance;
    component.elementModel = new DropdownElement({
      type: 'dropdown',
      id: 'test-id',
      alias: 'test-alias',
      options: [{ text: 'Option 1' }, { text: 'Option 2' }],
      dimensions: {
        width: 150,
        height: 30,
        isWidthFixed: false,
        isHeightFixed: true,
        minHeight: null,
        minWidth: 40
      }
    } as Partial<DropdownProperties>);
    component.parentForm = new UntypedFormGroup({
      'test-id': new UntypedFormControl(null)
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display label if not in clozeContext', () => {
    component.clozeContext = false;
    component.elementModel.label = 'Test Label';
    fixture.detectChanges();
    const labelElement = fixture.nativeElement.querySelector('mat-label');
    expect(labelElement.textContent).toContain('Test Label');
  });

  it('should NOT display label if in clozeContext', () => {
    component.clozeContext = true;
    fixture.detectChanges();
    const labelElement = fixture.nativeElement.querySelector('mat-label');
    expect(labelElement).toBeNull();
  });

  /* The colour reaches Material's generated wrapper through a CSS variable, and the rule that reads it
     used to sit inside the cloze block -- so a standalone dropdown kept the theme background (#1388).
     Measured on the rendered wrapper, not on the variable: the variable was set correctly all along. */
  [true, false].forEach(clozeContext => {
    it(`should paint the background colour on the wrapper, clozeContext=${clozeContext}`, () => {
      component.clozeContext = clozeContext;
      component.elementModel.styling.backgroundColor = 'rgb(255, 215, 0)';
      fixture.detectChanges();
      const wrapper = fixture.nativeElement.querySelector('.mat-mdc-text-field-wrapper');
      expect(window.getComputedStyle(wrapper).backgroundColor).toBe('rgb(255, 215, 0)');
    });
  });
});
