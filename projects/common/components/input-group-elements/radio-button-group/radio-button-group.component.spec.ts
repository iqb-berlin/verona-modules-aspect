import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Pipe, PipeTransform } from '@angular/core';
import {
  RadioButtonGroupElement, RadioButtonGroupProperties
} from 'common/models/elements/input-group-elements/radio-button-group';
import { SafeResourceHTMLPipe } from 'common/pipes/safe-resource-html.pipe';
import {
  FirstLineAlignedControlDirective
} from 'common/directives/first-line-aligned-control.directive';
import { RadioButtonGroupComponent } from './radio-button-group.component';

@Pipe({ name: 'errorTransform', standalone: false })
class MockErrorTransformPipe implements PipeTransform {
  transform(): string { return 'Error'; }
}

describe('RadioButtonGroupComponent', () => {
  let component: RadioButtonGroupComponent;
  let fixture: ComponentFixture<RadioButtonGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        RadioButtonGroupComponent,
        FirstLineAlignedControlDirective,
        SafeResourceHTMLPipe,
        MockErrorTransformPipe
      ],
      imports: [
        ReactiveFormsModule,
        MatRadioModule,
        MatFormFieldModule
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RadioButtonGroupComponent);
    component = fixture.componentInstance;
    component.elementModel = new RadioButtonGroupElement({
      type: 'radio',
      id: 'test-id',
      alias: 'test-alias',
      options: [{ text: 'Option A' }, { text: 'Option B' }, { text: 'Option C' }]
    } as Partial<RadioButtonGroupProperties>);
    component.parentForm = new UntypedFormGroup({
      'test-id': new UntypedFormControl(null)
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render one radio button per option', () => {
    const radioButtons = fixture.nativeElement.querySelectorAll('mat-radio-button');
    expect(radioButtons.length).toBe(3);
    expect(radioButtons[0].textContent).toContain('Option A');
  });

  it('should display the label', () => {
    component.elementModel.label = 'Test Label';
    fixture.detectChanges();
    const labelElement = fixture.nativeElement.querySelector('label');
    expect(labelElement.textContent).toContain('Test Label');
  });

  it('should set the form control to the option index on selection', () => {
    const radioInputs = fixture.nativeElement.querySelectorAll('input[type="radio"]');
    radioInputs[1].click();
    expect(component.elementFormControl.value).toBe(1);
  });

  it('should strike other options when strikeOtherOptions is set', () => {
    component.elementModel.strikeOtherOptions = true;
    component.elementFormControl.setValue(1);
    fixture.detectChanges();
    const radioButtons = fixture.nativeElement.querySelectorAll('mat-radio-button');
    expect(radioButtons[0].classList).toContain('strike');
    expect(radioButtons[1].classList).not.toContain('strike');
    expect(radioButtons[2].classList).toContain('strike');
  });

  it('should disable pointer events when readOnly', () => {
    component.elementModel.readOnly = true;
    fixture.detectChanges();
    const radioButton = fixture.nativeElement.querySelector('mat-radio-button');
    expect(radioButton.style.pointerEvents).toBe('none');
  });

  /* #960: which of the two alignments a task chose has to reach the option -- the class for the
     centred one, the measuring directive for the other. */
  describe('verticalButtonAlignment', () => {
    const options = (): HTMLElement[] => Array
      .from(fixture.nativeElement.querySelectorAll('mat-radio-button'));
    const directives = (): FirstLineAlignedControlDirective[] => fixture.debugElement
      .queryAll(By.directive(FirstLineAlignedControlDirective))
      .map(found => found.injector.get(FirstLineAlignedControlDirective));

    it('should align on the first line by default', () => {
      expect(options().every(option => !option.classList.contains('centered-control'))).toBe(true);
      expect(directives().every(directive => directive.firstLineAlignedControl)).toBe(true);
    });

    it('should mark every option and switch the directive off when centred', () => {
      component.elementModel.verticalButtonAlignment = 'center';
      fixture.detectChanges();

      expect(options().every(option => option.classList.contains('centered-control'))).toBe(true);
      expect(directives().every(directive => !directive.firstLineAlignedControl)).toBe(true);
    });
  });
});
