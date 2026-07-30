import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslateModule } from '@ngx-translate/core';
import {
  MergedCheckboxComponent
} from 'editor/src/app/modules/properties-panel/components/merged-checkbox/merged-checkbox.component';
import {
  BorderPropertiesComponent
} from './border-properties.component';

describe('BorderPropertiesComponent', () => {
  let component: BorderPropertiesComponent;
  let fixture: ComponentFixture<BorderPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BorderPropertiesComponent, MergedCheckboxComponent],
      imports: [
        MatCheckboxModule,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BorderPropertiesComponent);
    component = fixture.componentInstance;
    component.combinedProperties = {
      hasBorderTop: false,
      hasBorderBottom: false,
      hasBorderLeft: false,
      hasBorderRight: false
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a checkbox for every border side', () => {
    const checkboxLabels = Array.from(
      fixture.nativeElement.querySelectorAll('mat-checkbox') as NodeListOf<HTMLElement>
    ).map(checkbox => checkbox.textContent);
    expect(checkboxLabels.length).toBe(4);
    ['hasBorderTop', 'hasBorderBottom', 'hasBorderLeft', 'hasBorderRight'].forEach(property => {
      expect(checkboxLabels.some(label => label?.includes(`propertiesPanel.${property}`))).toBe(true);
    });
  });

  it('should emit updateModel when a border checkbox is toggled', () => {
    const emitted: { property: string; value: unknown }[] = [];
    component.updateModel.subscribe(update => emitted.push(update));

    const firstCheckboxInput = fixture.nativeElement
      .querySelector('mat-checkbox input') as HTMLInputElement;
    firstCheckboxInput.click();

    expect(emitted).toEqual([{ property: 'hasBorderTop', value: true }]);
  });
});
