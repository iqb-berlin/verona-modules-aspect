// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  Component, Input, Pipe, PipeTransform
} from '@angular/core';
import { CheckboxElement, CheckboxProperties } from 'common/models/elements/input-group-elements/checkbox';
import { InputElement } from 'common/models/elements/element';
import { SafeResourceHTMLPipe } from 'common/pipes/safe-resource-html.pipe';
import { CheckboxComponent } from './checkbox.component';

@Component({
  selector: 'aspect-cloze-child-error-message',
  template: '',
  standalone: false
})
class MockClozeChildErrorMessageComponent {
  @Input() elementModel!: InputElement;
  @Input() elementFormControl!: UntypedFormControl;
}

@Pipe({ name: 'errorTransform', standalone: false })
class MockErrorTransformPipe implements PipeTransform {
  transform(): string { return 'Error'; }
}

describe('CheckboxComponent', () => {
  let component: CheckboxComponent;
  let fixture: ComponentFixture<CheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        CheckboxComponent,
        MockClozeChildErrorMessageComponent,
        MockErrorTransformPipe,
        SafeResourceHTMLPipe
      ],
      imports: [
        ReactiveFormsModule,
        MatCheckboxModule,
        MatFormFieldModule
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckboxComponent);
    component = fixture.componentInstance;
    component.elementModel = new CheckboxElement({
      type: 'checkbox',
      id: 'test-id',
      alias: 'test-alias'
    } as Partial<CheckboxProperties>);
    component.parentForm = new UntypedFormGroup({
      'test-id': new UntypedFormControl(false)
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a mat-checkbox with the label if not in tableMode', () => {
    component.elementModel.label = 'Check me';
    fixture.detectChanges();
    const checkbox = fixture.nativeElement.querySelector('mat-checkbox');
    expect(checkbox).not.toBeNull();
    expect(checkbox.textContent).toContain('Check me');
    expect(fixture.nativeElement.querySelector('.svg-checkbox')).toBeNull();
  });

  it('should render an image instead of the label if imgSrc is set', () => {
    component.elementModel.imgSrc = 'data:image/png;base64,';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('mat-checkbox img')).not.toBeNull();
  });

  it('should render an svg checkbox instead of a mat-checkbox in tableMode', () => {
    component.tableMode = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.svg-checkbox')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('mat-checkbox')).toBeNull();
  });

  it('should toggle the form control value on click in tableMode', () => {
    component.tableMode = true;
    fixture.detectChanges();
    const svgCheckbox = fixture.nativeElement.querySelector('.svg-checkbox');
    svgCheckbox.click();
    expect(component.elementFormControl.value).toBe(true);
    expect(component.elementFormControl.touched).toBe(true);
    svgCheckbox.click();
    expect(component.elementFormControl.value).toBe(false);
  });

  it('should apply the strike class when crossOutChecked is set and the box is checked', () => {
    component.elementModel.crossOutChecked = true;
    component.elementFormControl.setValue(true);
    fixture.detectChanges();
    const checkbox = fixture.nativeElement.querySelector('mat-checkbox');
    expect(checkbox.classList).toContain('strike');
  });
});
