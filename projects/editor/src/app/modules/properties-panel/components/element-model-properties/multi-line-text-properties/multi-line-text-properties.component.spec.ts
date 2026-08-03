import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Component, DebugElement, Input } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { UnitService } from 'editor/src/app/services/unit.service';
import {
  NumberFieldBadInputDirective
} from 'editor/modules/editor-shared/directives/number-field-bad-input.directive';
import { NumberFieldDirective } from 'editor/modules/editor-shared/directives/number-field.directive';
import {
  MergedMarkerComponent
} from 'editor/modules/editor-shared/components/merged-marker/merged-marker.component';
import {
  MultiLineTextPropertiesComponent
} from './multi-line-text-properties.component';

// Declared instead of importing PropertiesPanelModule: a module import alongside declarations
// trips the AOT scope check in these specs (NG0304).
@Component({
  selector: 'aspect-merged-checkbox',
  standalone: false,
  template: '<ng-content></ng-content>'
})
class MockMergedCheckboxComponent {
  @Input() value: boolean | null | undefined;
  @Input() disabled: boolean = false;
}

describe('MultiLineTextPropertiesComponent', () => {
  let component: MultiLineTextPropertiesComponent;
  let fixture: ComponentFixture<MultiLineTextPropertiesComponent>;
  const unitServiceMock = { expertMode: true } as unknown as UnitService;

  const checkboxes = () => fixture.debugElement.queryAll(By.directive(MockMergedCheckboxComponent));
  const findCheckbox = (label: string) => checkboxes()
    .find(checkbox => checkbox.nativeElement.textContent.includes(label));
  const checkboxFor = (label: string): DebugElement => {
    const found = findCheckbox(label);
    if (!found) throw new Error(`expected a checkbox labelled ${label}`);
    return found;
  };
  const inputs = () => fixture.debugElement.queryAll(By.css('input'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MultiLineTextPropertiesComponent, MockMergedCheckboxComponent,
        NumberFieldDirective, NumberFieldBadInputDirective,
        MergedMarkerComponent
      ],
      imports: [
        FormsModule, MatFormFieldModule, MatIconModule, MatInputModule, MatTooltipModule,
        TranslateModule.forRoot()
      ],
      providers: [{ provide: UnitService, useValue: unitServiceMock }]
    }).compileComponents();

    fixture = TestBed.createComponent(MultiLineTextPropertiesComponent);
    component = fixture.componentInstance;
    unitServiceMock.expertMode = true;
    component.combinedProperties = {
      rowCount: 3, hasAutoHeight: false, hasDynamicRowCount: false, expectedCharactersCount: 100
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the row count and hide the expected characters while the row count is fixed', () => {
    expect(inputs().length).toBe(1);
    expect(inputs()[0].nativeElement.value).toBe('3');
  });

  it('should swap the row count for the expected characters on a dynamic row count', async () => {
    component.combinedProperties = {
      rowCount: 3, hasAutoHeight: false, hasDynamicRowCount: true, expectedCharactersCount: 100
    };
    fixture.detectChanges();
    await fixture.whenStable(); // NgModel writes the box in a microtask

    expect(inputs().length).toBe(1);
    expect(inputs()[0].nativeElement.value).toBe('100');
  });

  /* `rowCount` is declared `number`, and the box handed on `field.value` - the raw string. On top
     of that `|| 0` made every unreadable keystroke a 0, so clearing the box to retype wrote a 0
     first (#1164). */
  it('should emit the entered row count as a number', () => {
    const emitted: { property: string; value: unknown; isInputValid?: boolean | null }[] = [];
    component.updateModel.subscribe(update => emitted.push(update));

    const input = inputs()[0];
    input.nativeElement.value = '7';
    input.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(emitted).toEqual([{ property: 'rowCount', value: 7, isInputValid: true }]);
  });

  it('should refuse an emptied row count and put the box back', async () => {
    const emitted: { property: string; value: unknown; isInputValid?: boolean | null }[] = [];
    component.updateModel.subscribe(update => emitted.push(update));

    const input = inputs()[0];
    input.nativeElement.value = '';
    input.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(emitted).toEqual([]);

    input.nativeElement.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(emitted).toEqual([{ property: 'rowCount', value: null, isInputValid: false }]);
    expect(input.nativeElement.value).toBe('3');
  });

  it('should emit the toggled auto height', () => {
    const emitted: { property: string; value: unknown }[] = [];
    component.updateModel.subscribe(update => emitted.push(update));

    checkboxFor('hasAutoHeight').triggerEventHandler('valueChange', true);

    expect(emitted).toEqual([{ property: 'hasAutoHeight', value: true }]);
  });

  // The two height modes exclude each other, each disabling the other's switch.
  it('should disable the auto height while the row count is dynamic', () => {
    component.combinedProperties = { hasAutoHeight: false, hasDynamicRowCount: true };
    fixture.detectChanges();

    expect(checkboxFor('hasAutoHeight').componentInstance.disabled).toBe(true);
    expect(checkboxFor('hasDynamicRowCount').componentInstance.disabled).toBe(false);
  });

  it('should disable the dynamic row count while the height is automatic', () => {
    component.combinedProperties = { hasAutoHeight: true, hasDynamicRowCount: false };
    fixture.detectChanges();

    expect(checkboxFor('hasDynamicRowCount').componentInstance.disabled).toBe(true);
  });

  it('should hide the auto height outside expert mode', () => {
    unitServiceMock.expertMode = false;
    fixture.detectChanges();

    expect(findCheckbox('hasAutoHeight')).toBeUndefined();
    expect(findCheckbox('hasDynamicRowCount')).not.toBeUndefined();
  });

  // The math text area shares only rowCount and hasAutoHeight.
  it('should show only the shared controls when the text-area-only ones are absent', async () => {
    component.combinedProperties = { rowCount: 4, hasAutoHeight: false };
    fixture.detectChanges();
    await fixture.whenStable(); // NgModel writes the box in a microtask

    expect(findCheckbox('hasDynamicRowCount')).toBeUndefined();
    expect(inputs().length).toBe(1);
    expect(inputs()[0].nativeElement.value).toBe('4');
  });

  it('should render nothing for an element without any of the properties', () => {
    component.combinedProperties = {};
    fixture.detectChanges();

    expect(checkboxes().length).toBe(0);
    expect(inputs().length).toBe(0);
  });

  /* `rowCount` becomes the `rows` attribute of the textarea, so a 0 or a negative one is not a
     count at all. Nothing enforced that before (#1164). */
  it('should refuse a row count below one', async () => {
    const emitted: { property: string; value: unknown; isInputValid?: boolean | null }[] = [];
    component.updateModel.subscribe(update => emitted.push(update));

    const input = inputs()[0];
    input.nativeElement.value = '0';
    input.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    input.nativeElement.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(emitted).toEqual([{ property: 'rowCount', value: 0, isInputValid: false }]);
    expect(input.nativeElement.value).toBe('3');
  });
});
