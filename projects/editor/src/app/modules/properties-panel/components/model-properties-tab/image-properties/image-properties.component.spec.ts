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

describe('ImagePropertiesComponent', () => {
  let component: ImagePropertiesComponent;
  let fixture: ComponentFixture<ImagePropertiesComponent>;
  let emitted: { property: string; value: unknown; isInputValid?: boolean | null }[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImagePropertiesComponent, MergedCheckboxComponent],
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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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

  it('should emit the magnifier size together with its validity', () => {
    const sizeInput = fixture.nativeElement.querySelector('input[type="number"]') as HTMLInputElement;
    expect(sizeInput.value).toBe('100');

    sizeInput.value = '200';
    sizeInput.dispatchEvent(new Event('input'));

    expect(emitted).toEqual([{ property: 'magnifierSize', value: 200, isInputValid: true }]);
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
