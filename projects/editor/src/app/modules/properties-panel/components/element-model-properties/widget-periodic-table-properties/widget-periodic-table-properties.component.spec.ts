import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import {
  MergedCheckboxComponent
} from 'editor/src/app/modules/properties-panel/components/merged-checkbox/merged-checkbox.component';
import {
  NumberFieldBadInputDirective
} from 'editor/modules/editor-shared/directives/number-field-bad-input.directive';
import { NumberFieldDirective } from 'editor/modules/editor-shared/directives/number-field.directive';
import {
  MergedMarkerComponent
} from 'editor/modules/editor-shared/components/merged-marker/merged-marker.component';
import {
  WidgetPeriodicTablePropertiesComponent
} from './widget-periodic-table-properties.component';

describe('WidgetPeriodicTablePropertiesComponent', () => {
  let component: WidgetPeriodicTablePropertiesComponent;
  let fixture: ComponentFixture<WidgetPeriodicTablePropertiesComponent>;
  let emitted: { property: string; value: unknown }[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        WidgetPeriodicTablePropertiesComponent, MergedCheckboxComponent,
        NumberFieldDirective, NumberFieldBadInputDirective,
        MergedMarkerComponent
      ],
      imports: [
        MatTooltipModule,
        MatIconModule,
        FormsModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WidgetPeriodicTablePropertiesComponent);
    component = fixture.componentInstance;
    component.combinedProperties = {
      showInfoOrder: true,
      showInfoENeg: false,
      showInfoAMass: false,
      closeOnSelection: false,
      maxNumberOfSelections: 3
    };
    emitted = [];
    component.updateModel.subscribe(update => emitted.push(update));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reflect the current info settings', () => {
    const inputs = Array.from(
      fixture.nativeElement.querySelectorAll('mat-checkbox input') as NodeListOf<HTMLInputElement>
    );
    expect(inputs.map(input => input.checked)).toEqual([true, false, false, false]);
    expect((fixture.nativeElement.querySelector('input[type="number"]') as HTMLInputElement).value).toBe('3');
  });

  it('should emit updateModel when an info checkbox is toggled', () => {
    const eNegInput = Array.from(
      fixture.nativeElement.querySelectorAll('mat-checkbox input') as NodeListOf<HTMLInputElement>
    )[1];
    eNegInput.click();

    expect(emitted).toEqual([{ property: 'showInfoENeg', value: true }]);
  });

  /* `maxNumberOfSelections` is declared `number`, and the box handed on `field.value` - the raw
     string (#1164). */
  it('should emit the maximum number of selections as a number', () => {
    const numberInput = fixture.nativeElement.querySelector('input[type="number"]') as HTMLInputElement;
    numberInput.value = '5';
    numberInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(emitted).toEqual([{ property: 'maxNumberOfSelections', value: 5, isInputValid: true }]);
  });

  /* An emptied box used to write a 0 on the keystroke that emptied it - so clearing the field to
     retype set "unlimited selections" in passing. It is refused on leaving now. */
  it('should refuse an emptied maximum number of selections', async () => {
    const numberInput = fixture.nativeElement.querySelector('input[type="number"]') as HTMLInputElement;
    numberInput.value = '';
    numberInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(emitted).toEqual([]);

    numberInput.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(emitted).toEqual([{ property: 'maxNumberOfSelections', value: null, isInputValid: false }]);
    expect(numberInput.value).toBe('3');
  });

  /* The value travels into the widget call unchanged, so what a 0 does is decided in the widget:
     `maxSelectCount < 1` skips its limit check, which makes the selection unlimited rather than
     impossible (`ps-select.service.ts` in iqb-berlin/verona-widgets-chemistry). The field is the
     only place an author can learn that (#1350). */
  it('should say what a zero number of selections means', () => {
    const hints = Array.from(
      fixture.nativeElement.querySelectorAll('mat-hint') as NodeListOf<HTMLElement>
    ).map(hint => hint.textContent?.trim());

    expect(hints).toEqual(['propertiesPanel.maxNumberOfSelectionsHint']);
  });
});
