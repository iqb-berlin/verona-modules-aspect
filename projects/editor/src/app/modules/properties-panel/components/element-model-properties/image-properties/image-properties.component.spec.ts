import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { TranslateModule } from '@ngx-translate/core';
import {
  MergedCheckboxComponent
} from 'editor/src/app/modules/properties-panel/components/merged-checkbox/merged-checkbox.component';
import {
  ImagePropertiesComponent
} from './image-properties.component';
import { NumberFieldDirective } from '../../../directives/number-field.directive';

describe('ImagePropertiesComponent', () => {
  let component: ImagePropertiesComponent;
  let fixture: ComponentFixture<ImagePropertiesComponent>;
  let emitted: { property: string; value: unknown; isInputValid?: boolean | null }[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImagePropertiesComponent, MergedCheckboxComponent, NumberFieldDirective],
      imports: [
        CommonModule,
        FormsModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        MatSliderModule,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ImagePropertiesComponent);
    component = fixture.componentInstance;
    component.combinedProperties = {
      scale: false,
      magnifier: true,
      allowFullscreen: false,
      magnifierSize: 100,
      magnifierZoom: 1.5
    };
    emitted = [];
    component.updateModel.subscribe(update => emitted.push(update));
    // `alt` is set per test below - the fixture above leaves it out so the other tests see the panel
    // as it looks for an image that has no alternative text yet.
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /* The alternative text moved here from the grab bag when this component was renamed from
     scale-and-zoom to image: it is ImageProperties.alt, the HTML alt attribute of the <img>, shown
     when the image fails to load and read by screen readers. */
  describe('the alternative text', () => {
    const altInput = (): HTMLInputElement | null => fixture.nativeElement
      .querySelector('input[type="text"]');

    it('should show the current text and emit an edit', () => {
      component.combinedProperties = { alt: 'Ein Diagramm' };
      fixture.detectChanges();

      const input = altInput() as HTMLInputElement;
      expect(input.value).toBe('Ein Diagramm');

      input.value = 'Ein Balkendiagramm';
      input.dispatchEvent(new Event('input'));

      expect(emitted).toEqual([{ property: 'alt', value: 'Ein Balkendiagramm' }]);
    });

    /* The component is bound for every element type, so the field has to guard itself - only the
       image has an alt. */
    it('should stay away for an element without an alt', () => {
      expect(altInput()).toBeNull();
    });
  });

  it('should render a checkbox for every defined property', () => {
    const labels = Array.from(
      fixture.nativeElement.querySelectorAll('mat-checkbox') as NodeListOf<HTMLElement>
    ).map(checkbox => checkbox.textContent);
    expect(labels.length).toBe(3);
    ['scale', 'magnifier', 'allowFullscreen'].forEach(property => {
      expect(labels.some(label => label?.includes(`propertiesPanel.${property}`))).toBe(true);
    });
  });

  it('should emit updateModel when the scale checkbox is toggled', () => {
    const scaleInput = fixture.nativeElement.querySelector('mat-checkbox input') as HTMLInputElement;
    scaleInput.click();

    expect(emitted).toEqual([{ property: 'scale', value: true }]);
  });

  it('should emit the magnifier size', () => {
    const sizeInput = fixture.nativeElement.querySelector('input[type="number"]') as HTMLInputElement;
    expect(sizeInput.value).toBe('100');

    sizeInput.value = '200';
    sizeInput.dispatchEvent(new Event('input'));

    expect(emitted).toEqual([{ property: 'magnifierSize', value: 200, isInputValid: true }]);
  });

  /* `magnifierSize` is declared `number`, so an emptied box means zero rather than null - and the
     zero belongs on leaving the field, not on the keystroke that empties it, because a box the
     browser cannot parse yet reads as empty too (#1154). */
  describe('leaving the magnifier size field', () => {
    const sizeInput = (): HTMLInputElement => fixture.nativeElement
      .querySelector('input[type="number"]') as HTMLInputElement;

    it('should emit zero for a size left empty', () => {
      sizeInput().value = '';
      sizeInput().dispatchEvent(new Event('input'));
      expect(emitted).toEqual([]); // still mid-edit, nothing written

      sizeInput().dispatchEvent(new Event('change'));

      expect(emitted).toEqual([{ property: 'magnifierSize', value: 0, isInputValid: true }]);
    });

    /* `min="0"` makes -5 invalid. Nothing is written while it is typed, the host is told once on
       leaving so it can warn, and the box goes back to what the model holds. */
    it('should report a negative size once and put the box back', async () => {
      ['-5', '-50'].forEach(value => {
        sizeInput().value = value;
        sizeInput().dispatchEvent(new Event('input'));
        fixture.detectChanges();
      });
      expect(emitted).toEqual([]);

      sizeInput().dispatchEvent(new Event('change'));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(emitted).toEqual([{ property: 'magnifierSize', value: -50, isInputValid: false }]);
      expect(sizeInput().value).toBe('100');
    });

    it('should not emit on leaving a field that holds a value', () => {
      sizeInput().value = '200';
      sizeInput().dispatchEvent(new Event('input'));
      emitted.length = 0;

      sizeInput().dispatchEvent(new Event('change'));

      expect(emitted).toEqual([]);
    });
  });

  it('should disable the magnifier size when the magnifier is off', async () => {
    component.combinedProperties = {
      scale: false, magnifier: false, magnifierSize: 100, magnifierZoom: 1.5
    };
    fixture.detectChanges();
    // NgModel applies the disabled state in a microtask
    await fixture.whenStable();

    const sizeInput = fixture.nativeElement.querySelector('input[type="number"]') as HTMLInputElement;
    expect(sizeInput.disabled).toBe(true);
  });
});
