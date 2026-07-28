import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { UIElement } from 'common/models/elements/element';
import {
  MergedCheckboxComponent
} from 'editor/src/app/components/properties-panel/fields/merged-checkbox/merged-checkbox.component';
import {
  WidgetPeriodicTablePropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/widget-periodic-table-properties/widget-periodic-table-properties.component';

describe('WidgetPeriodicTablePropertiesComponent', () => {
  let component: WidgetPeriodicTablePropertiesComponent;
  let fixture: ComponentFixture<WidgetPeriodicTablePropertiesComponent>;
  let emitted: { property: string; value: unknown }[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WidgetPeriodicTablePropertiesComponent, MergedCheckboxComponent],
      imports: [
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
    } as unknown as UIElement;
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

  it('should emit the maximum number of selections', () => {
    const numberInput = fixture.nativeElement.querySelector('input[type="number"]') as HTMLInputElement;
    numberInput.value = '5';
    numberInput.dispatchEvent(new Event('input'));

    expect(emitted).toEqual([{ property: 'maxNumberOfSelections', value: '5' }]);
  });

  it('should fall back to zero for an empty maximum number of selections', () => {
    const numberInput = fixture.nativeElement.querySelector('input[type="number"]') as HTMLInputElement;
    numberInput.value = '';
    numberInput.dispatchEvent(new Event('input'));

    expect(emitted).toEqual([{ property: 'maxNumberOfSelections', value: 0 }]);
  });
});
