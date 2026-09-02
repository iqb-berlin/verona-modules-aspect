import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Pipe, PipeTransform } from '@angular/core';
import { UntypedFormControl, ValidationErrors } from '@angular/forms';
import { InputElement } from 'common/models/elements/element';
import { ClozeChildErrorMessageComponent } from './cloze-child-error-message.component';

@Pipe({
  name: 'errorTransform',
  standalone: false
})
class MockErrorTransformPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(_errors: ValidationErrors | null, _elementModel: InputElement): string {
    return 'Transformed Error';
  }
}

describe('ClozeChildErrorMessageComponent', () => {
  let component: ClozeChildErrorMessageComponent;
  let fixture: ComponentFixture<ClozeChildErrorMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClozeChildErrorMessageComponent, MockErrorTransformPipe]
    }).compileComponents();

    fixture = TestBed.createComponent(ClozeChildErrorMessageComponent);
    component = fixture.componentInstance;
    component.elementModel = {
      id: 'test-id',
      type: 'text-field',
      dimensions: {
        width: 100, height: 20, isWidthFixed: true, isHeightFixed: true
      }
    } as unknown as InputElement;
    component.elementFormControl = new UntypedFormControl();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display error message when form control has errors', () => {
    component.elementFormControl.setErrors({ required: true });
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Transformed Error');
  });
});
