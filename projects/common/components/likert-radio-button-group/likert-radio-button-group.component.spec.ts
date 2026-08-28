import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { Component, Input } from '@angular/core';
import {
  LikertRowElement, LikertRowProperties
} from 'common/models/elements/likert-row';
import { DragNDropValueObject, TextImageLabel } from 'common/models/label-interfaces';
import {
  FirstLineAlignedControlDirective
} from 'common/directives/first-line-aligned-control.directive';
import { LikertRadioButtonGroupComponent } from './likert-radio-button-group.component';

@Component({
  selector: 'aspect-text-image-panel',
  template: '{{label.text}}',
  standalone: false
})
class MockTextImagePanelComponent {
  @Input() label!: TextImageLabel | DragNDropValueObject;
}

describe('LikertRadioButtonGroupComponent', () => {
  let component: LikertRadioButtonGroupComponent;
  let fixture: ComponentFixture<LikertRadioButtonGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        LikertRadioButtonGroupComponent,
        MockTextImagePanelComponent,
        FirstLineAlignedControlDirective
      ],
      imports: [
        ReactiveFormsModule,
        MatRadioModule
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LikertRadioButtonGroupComponent);
    component = fixture.componentInstance;
    component.elementModel = new LikertRowElement({
      type: 'likert-row',
      id: 'test-id',
      alias: 'test-alias',
      columnCount: 3,
      rowLabel: {
        text: 'Row Label', imgSrc: null, imgFileName: '', imgPosition: 'left'
      }
    } as Partial<LikertRowProperties>);
    component.firstColumnSizeRatio = 2;
    component.parentForm = new UntypedFormGroup({
      'test-id': new UntypedFormControl(null)
    });
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should use the form control of the parent form', () => {
    fixture.detectChanges();
    expect(component.elementFormControl).toBe(component.parentForm.controls['test-id']);
  });

  it('should render one radio button per column', () => {
    fixture.detectChanges();
    const radioButtons = fixture.nativeElement.querySelectorAll('mat-radio-button');
    expect(radioButtons.length).toBe(3);
  });

  it('should render the row label', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Row Label');
  });

  it('should set the form control value to the index of the clicked radio button', () => {
    fixture.detectChanges();
    const radioInputs: NodeListOf<HTMLInputElement> = fixture.nativeElement.querySelectorAll('input[type="radio"]');
    radioInputs[1].click();
    fixture.detectChanges();
    expect(component.elementFormControl.value).toBe(1);
  });

  it('should disable pointer events on radio buttons when read-only', () => {
    component.elementModel.readOnly = true;
    fixture.detectChanges();
    const radioButton: HTMLElement = fixture.nativeElement.querySelector('mat-radio-button');
    expect(radioButton.style.pointerEvents).toBe('none');
  });

  it('should update the form control via setElementValue', () => {
    fixture.detectChanges();
    component.setElementValue(2);
    expect(component.elementFormControl.value).toBe(2);
  });
});
