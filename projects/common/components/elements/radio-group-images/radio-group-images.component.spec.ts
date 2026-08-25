// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  Component, Input, Pipe, PipeTransform
} from '@angular/core';
import {
  RadioButtonGroupComplexElement, RadioButtonGroupComplexProperties
} from 'common/models/elements/radio-button-group-complex';
import { DragNDropValueObject, TextImageLabel } from 'common/models/label-interfaces';
import { SafeResourceHTMLPipe } from 'common/pipes/safe-resource-html.pipe';
import { RadioGroupImagesComponent } from './radio-group-images.component';

@Component({
  selector: 'aspect-text-image-panel',
  template: '<span>{{label.text}}</span>',
  standalone: false
})
class MockTextImagePanelComponent {
  @Input() label!: TextImageLabel | DragNDropValueObject;
  @Input() hideContent: boolean = false;
}

@Pipe({ name: 'errorTransform', standalone: false })
class MockErrorTransformPipe implements PipeTransform {
  transform(): string { return 'Error'; }
}

describe('RadioGroupImagesComponent', () => {
  let component: RadioGroupImagesComponent;
  let fixture: ComponentFixture<RadioGroupImagesComponent>;

  const createOption = (text: string): TextImageLabel => ({
    text,
    imgSrc: null,
    imgFileName: '',
    imgPosition: 'above'
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        RadioGroupImagesComponent,
        MockTextImagePanelComponent,
        MockErrorTransformPipe,
        SafeResourceHTMLPipe
      ],
      imports: [
        ReactiveFormsModule,
        MatRadioModule,
        MatFormFieldModule
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RadioGroupImagesComponent);
    component = fixture.componentInstance;
    component.elementModel = new RadioButtonGroupComplexElement({
      type: 'radio-group-images',
      id: 'test-id',
      alias: 'test-alias',
      options: [createOption('Option A'), createOption('Option B'), createOption('Option C')]
    } as Partial<RadioButtonGroupComplexProperties>);
    component.parentForm = new UntypedFormGroup({
      'test-id': new UntypedFormControl(null)
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render one radio button with a text image panel per option', () => {
    const radioButtons = fixture.nativeElement.querySelectorAll('mat-radio-button');
    expect(radioButtons.length).toBe(3);
    expect(radioButtons[1].querySelector('aspect-text-image-panel').textContent).toContain('Option B');
  });

  it('should distribute options according to itemsPerRow', () => {
    component.elementModel.itemsPerRow = 2;
    fixture.detectChanges();
    const radioGroup = fixture.nativeElement.querySelector('mat-radio-group');
    expect(radioGroup.style.gridTemplateColumns).toBe('repeat(2, 1fr)');
  });

  it('should distribute all options in one row if itemsPerRow is not set', () => {
    component.elementModel.itemsPerRow = null;
    fixture.detectChanges();
    const radioGroup = fixture.nativeElement.querySelector('mat-radio-group');
    expect(radioGroup.style.gridTemplateColumns).toBe('repeat(3, 1fr)');
  });

  it('should set the form control to the option index on selection', () => {
    const radioInputs = fixture.nativeElement.querySelectorAll('input[type="radio"]');
    radioInputs[2].click();
    expect(component.elementFormControl.value).toBe(2);
  });
});
