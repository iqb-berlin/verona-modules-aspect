import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Pipe, PipeTransform } from '@angular/core';
import {
  SpellCorrectElement, SpellCorrectProperties
} from 'common/models/elements/spell-correct';
import { SpellCorrectComponent } from './spell-correct.component';

@Pipe({ name: 'errorTransform', standalone: false })
class MockErrorTransformPipe implements PipeTransform {
  transform(): string { return 'Error'; }
}

describe('SpellCorrectComponent', () => {
  let component: SpellCorrectComponent;
  let fixture: ComponentFixture<SpellCorrectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        SpellCorrectComponent,
        MockErrorTransformPipe
      ],
      imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpellCorrectComponent);
    component = fixture.componentInstance;
    component.elementModel = new SpellCorrectElement({
      type: 'spell-correct',
      id: 'test-id',
      alias: 'test-alias'
    } as Partial<SpellCorrectProperties>);
    component.elementModel.label = 'Testwort';
    component.parentForm = new UntypedFormGroup({
      'test-id': new UntypedFormControl(null)
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the label on the button', () => {
    const button = fixture.nativeElement.querySelector('.spell-correct-button');
    expect(button.textContent).toContain('Testwort');
  });

  it('should set the form control to an empty string when the untouched word is struck through', () => {
    const button = fixture.nativeElement.querySelector('.spell-correct-button');
    button.click();
    expect(component.elementFormControl.value).toBe('');
  });

  it('should reset the form control when the strike through is removed', () => {
    component.elementFormControl.setValue('korrigiert');
    const button = fixture.nativeElement.querySelector('.spell-correct-button');
    button.click();
    expect(component.elementFormControl.value).toBeNull();
  });

  it('should strike through the button label when the word is marked as wrong', () => {
    const button = fixture.nativeElement.querySelector('.spell-correct-button');
    button.click();
    fixture.detectChanges();
    expect(button.style.textDecorationLine).toBe('line-through');
  });

  it('should disable the button if the element is readOnly', () => {
    component.elementModel.readOnly = true;
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('.spell-correct-button');
    expect(button.disabled).toBe(true);
  });
});
