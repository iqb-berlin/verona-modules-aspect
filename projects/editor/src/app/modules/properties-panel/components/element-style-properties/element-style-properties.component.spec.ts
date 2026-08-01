import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { Stylings } from 'common/models/elements/property-group-interfaces';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import {
  MergedCheckboxComponent
} from 'editor/src/app/modules/properties-panel/components/merged-checkbox/merged-checkbox.component';
import { ElementService } from 'editor/src/app/services/element.service';
import {
  ElementStylePropertiesComponent
} from 'editor/src/app/modules/properties-panel/components/element-style-properties/element-style-properties.component';

describe('ElementStylePropertiesComponent', () => {
  let component: ElementStylePropertiesComponent;
  let fixture: ComponentFixture<ElementStylePropertiesComponent>;
  let elementService: SpyObj<ElementService>;

  beforeEach(async () => {
    elementService = createSpyObj<ElementService>(['updateSelectedElementsStyleProperty']);

    await TestBed.configureTestingModule({
      declarations: [ElementStylePropertiesComponent, MergedCheckboxComponent],
      imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: ElementService, useValue: elementService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ElementStylePropertiesComponent);
    component = fixture.componentInstance;
    component.styles = {
      backgroundColor: '#ffffff',
      fontColor: '#000000',
      bold: false,
      italic: false,
      underline: false,
      fontSize: 20
    } as Stylings;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render fields for the given style properties only', () => {
    const labels = Array.from(
      fixture.nativeElement.querySelectorAll('mat-label') as NodeListOf<HTMLElement>
    ).map(label => label.textContent);
    expect(labels.some(label => label?.includes('propertiesPanel.backgroundColor'))).toBe(true);
    expect(labels.some(label => label?.includes('propertiesPanel.lineHeight'))).toBe(false);
    expect(fixture.nativeElement.querySelector('fieldset')).toBeNull(); // no border styles given
  });

  it('should update the style property when a checkbox is toggled', () => {
    const boldCheckbox = Array.from(
      fixture.nativeElement.querySelectorAll('mat-checkbox') as NodeListOf<HTMLElement>
    ).find(checkbox => checkbox.textContent?.includes('propertiesPanel.bold'));

    boldCheckbox?.querySelector('input')?.click();

    expect(elementService.updateSelectedElementsStyleProperty).toHaveBeenCalledWith('bold', true);
  });

  it('should update the style property when a text value is entered', () => {
    const colorInput = fixture.nativeElement.querySelector('input[type="text"]') as HTMLInputElement;
    colorInput.value = '#ff0000';
    colorInput.dispatchEvent(new Event('input'));

    expect(elementService.updateSelectedElementsStyleProperty)
      .toHaveBeenCalledWith('backgroundColor', '#ff0000');
  });
});
