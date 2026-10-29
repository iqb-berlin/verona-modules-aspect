// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  Component, Input, Pipe, PipeTransform
} from '@angular/core';
import { CheckboxElement, CheckboxProperties } from 'common/models/elements/checkbox';
import { InputElement } from 'common/models/elements/element';
import { SafeResourceHTMLPipe } from 'common/pipes/safe-resource-html.pipe';
import {
  FirstLineAlignedControlDirective
} from 'common/directives/first-line-aligned-control.directive';
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
        FirstLineAlignedControlDirective,
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

  /* In a gap the message belongs to the gap, and only the shared one carries a border and a background
     of its own; `mat-error` would print red letters onto the running text (#1052). */
  describe('required message', () => {
    const failValidation = (): void => {
      component.elementModel.required = true;
      component.elementFormControl.setValidators(() => ({ required: true }));
      component.elementFormControl.updateValueAndValidity();
      component.elementFormControl.markAsTouched();
      fixture.detectChanges();
    };

    it('should use the shared message in a cloze gap', () => {
      component.clozeContext = true;
      failValidation();

      expect(fixture.nativeElement.querySelector('aspect-cloze-child-error-message')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('mat-error')).toBeNull();
    });

    it('should use its own mat-error outside a cloze gap', () => {
      failValidation();

      expect(fixture.nativeElement.querySelector('mat-error')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('aspect-cloze-child-error-message')).toBeNull();
    });

    it('should show no message while the control is untouched', () => {
      component.clozeContext = true;
      component.elementModel.required = true;
      component.elementFormControl.setValidators(() => ({ required: true }));
      component.elementFormControl.updateValueAndValidity();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('aspect-cloze-child-error-message')).toBeNull();
      expect(fixture.nativeElement.querySelector('mat-error')).toBeNull();
    });
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

  /* #960: which of the two alignments a task chose has to reach the box -- the class for the centred
     one, the measuring directive for the other. An image label is neither: it sits above the box. */
  describe('verticalButtonAlignment', () => {
    const box = (): HTMLElement => fixture.nativeElement.querySelector('mat-checkbox');
    const directive = (): FirstLineAlignedControlDirective => fixture.debugElement
      .query(By.directive(FirstLineAlignedControlDirective))
      .injector.get(FirstLineAlignedControlDirective);

    it('should align on the first line by default', () => {
      expect(box().classList).not.toContain('centered-control');
      expect(directive().firstLineAlignedControl).toBe(true);
    });

    it('should mark the box and switch the directive off when centred', () => {
      component.elementModel.verticalButtonAlignment = 'center';
      fixture.detectChanges();

      expect(box().classList).toContain('centered-control');
      expect(directive().firstLineAlignedControl).toBe(false);
    });

    it('should not measure a line when an image stands in for the label', () => {
      component.elementModel.imgSrc = 'data:image/png;base64,iVBORw0KGgo=';
      fixture.detectChanges();

      expect(directive().firstLineAlignedControl).toBe(false);
    });

    /* An image label stacks image over box, so neither alignment means anything there -- and the
       centred rules would drop the gap between the two (found in review). */
    it('should leave an image label alone even when centred', () => {
      component.elementModel.imgSrc = 'data:image/png;base64,iVBORw0KGgo=';
      component.elementModel.verticalButtonAlignment = 'center';
      fixture.detectChanges();

      expect(box().classList).not.toContain('centered-control');
      expect(directive().firstLineAlignedControl).toBe(false);
    });
  });

  /* The gap gives its children their line; here the host does, with a height to tell it apart from the
     36px a checkbox used to inherit from the cloze (#1619). The size of the box's state layer is the
     theme's, which the tests do not load; without it the padding above the label came to nothing. */
  describe('in a gap', () => {
    beforeEach(() => {
      component.clozeContext = true;
      (fixture.nativeElement as HTMLElement).style.lineHeight = '30px';
      (fixture.nativeElement as HTMLElement).style.setProperty('--mat-checkbox-state-layer-size', '40px');
      fixture.detectChanges();
    });

    const host = (): HTMLElement => fixture.nativeElement as HTMLElement;
    const band = (): HTMLElement => fixture.nativeElement.querySelector('.mat-form-field');
    const label = (): HTMLElement => fixture.nativeElement.querySelector('.mdc-label');
    const fillGap = (height: number): void => {
      host().style.display = 'block';
      host().style.height = `${height}px`;
    };

    it('should mark the band as standing in a gap', () => {
      expect(band().classList).toContain('cloze-context');
    });

    it('should hide the box', () => {
      expect(getComputedStyle(fixture.nativeElement.querySelector('.mdc-checkbox')).display).toBe('none');
    });

    it('should drop the padding that put the label beside the box', () => {
      expect(getComputedStyle(label()).paddingTop).toBe('0px');
    });

    it('should make the band its line plus 1px above and below', () => {
      expect(band().getBoundingClientRect().height).toBe(32);
    });

    it('should fill a taller gap with the band and keep the text in its middle', () => {
      fillGap(50);
      const box = band().getBoundingClientRect();
      const text = (label().firstElementChild as HTMLElement).getBoundingClientRect();

      expect(box.height).toBe(50);
      expect(Math.abs((text.top + text.bottom) / 2 - (box.top + box.bottom) / 2)).toBeLessThan(1);
    });

    /* The label takes the click. Centred in the band at the height of its text, it left the rest of a
       taller band dead. */
    it('should let the whole height of a taller band take the click', () => {
      fillGap(50);
      const box = band().getBoundingClientRect();
      const inside = (y: number): boolean => label().contains(document.elementFromPoint(box.left + 5, y));

      expect(inside(box.top + 2)).toBe(true);
      expect(inside(box.bottom - 2)).toBe(true);
    });

    it('should keep the label where its paragraph aligns text', () => {
      host().style.display = 'block';
      host().style.width = '300px';
      host().style.textAlign = 'center';
      const box = band().getBoundingClientRect();
      const text = label().getBoundingClientRect();

      expect(Math.abs((text.left + text.right) / 2 - (box.left + box.right) / 2)).toBeLessThan(1);
    });
  });
});
