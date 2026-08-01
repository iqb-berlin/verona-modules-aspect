import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { PositionProperties } from 'common/models/elements/property-group-interfaces';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { UnitService } from 'editor/src/app/services/unit.service';
import {
  PositionFieldSetComponent
} from 'editor/src/app/modules/properties-panel/components/position-field-set/position-field-set.component';

@Component({
  selector: 'aspect-size-input-panel',
  standalone: false,
  template: ''
})
class MockSizeInputPanelComponent {
  @Input() label!: string;
  @Input() value: number | null | undefined;
  @Input() unit: string | null | undefined;
  @Input() allowedUnits!: string[];
  @Output() valueUpdated = new EventEmitter<{ value: number, unit: string }>();
}

describe('PositionFieldSetComponent', () => {
  let component: PositionFieldSetComponent;
  let fixture: ComponentFixture<PositionFieldSetComponent>;

  // Rebuilt per test: one test switches the section to dynamic positioning.
  let unitServiceMock: UnitService;
  const selectionServiceMock = {
    selectedPageIndex: 0,
    selectedSectionIndex: 0
  } as unknown as SelectionService;

  beforeEach(async () => {
    unitServiceMock = {
      unit: { pages: [{ sections: [{ dynamicPositioning: false }] }] }
    } as unknown as UnitService;

    await TestBed.configureTestingModule({
      declarations: [PositionFieldSetComponent, MockSizeInputPanelComponent],
      imports: [
        CommonModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatTooltipModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: UnitService, useValue: unitServiceMock },
        { provide: SelectionService, useValue: selectionServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PositionFieldSetComponent);
    component = fixture.componentInstance;
    component.positionProperties = {
      xPosition: 10,
      yPosition: 20,
      zIndex: 0
    } as PositionProperties;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show x/y position fields for static positioning', () => {
    const labels = Array.from(
      fixture.nativeElement.querySelectorAll('mat-label') as NodeListOf<HTMLElement>
    ).map(label => label.textContent);
    expect(labels.some(label => label?.includes('propertiesPanel.xPosition'))).toBe(true);
    expect(labels.some(label => label?.includes('propertiesPanel.yPosition'))).toBe(true);
  });

  it('should emit updateModel when the x position is changed', () => {
    const emitted: { property: string; value: unknown, isInputValid?: boolean | null }[] = [];
    component.updateModel.subscribe(update => emitted.push(update));

    const xInput = fixture.nativeElement.querySelector('input[type="number"]') as HTMLInputElement;
    xInput.value = '42';
    xInput.dispatchEvent(new Event('input'));

    expect(emitted).toEqual([{ property: 'xPosition', value: 42, isInputValid: true }]);
  });

  /* Typing into a number field passes through states the accessor reports as null - an empty box,
     or a lone "-" the browser cannot parse yet. Anything emitted then is written and comes straight
     back into the box through the model, stamping over what is being typed. Simulated here by
     feeding the emitted value back the way the host does. */
  it('should let a negative number be typed into the z-index', async () => {
    const emitted: { property: string; value: unknown }[] = [];
    component.updateModel.subscribe(update => emitted.push(update));
    component.positionProperties = { xPosition: 10, yPosition: 20, zIndex: -1 } as PositionProperties;
    fixture.detectChanges();
    await fixture.whenStable();
    const zInput = Array.from(
      fixture.nativeElement.querySelectorAll('input[type="number"]') as NodeListOf<HTMLInputElement>
    ).at(-1) as HTMLInputElement;

    // First keystroke of "-2": the browser cannot parse "-", the accessor reports null.
    zInput.value = '';
    zInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    // What the host would do with whatever was emitted.
    if (emitted.length) {
      component.positionProperties = {
        ...component.positionProperties, zIndex: emitted[0].value
      } as PositionProperties;
      fixture.detectChanges();
      await fixture.whenStable();
    }

    expect(zInput.value).not.toBe('0');
  });

  /* `xPosition` is declared `number`, so an emptied field must not send null down the write path -
     that is how null reached the saved unit definition (#1154). An empty field means 0, and it
     stays a valid input, so it is written rather than warned about. A `(change)` handler used to
     patch the display to 0 afterwards; the value now arrives correct in the first place.

     Note the contrast with the margin test below, where null is the right answer: there it means
     "the selected elements disagree", here it means "the user cleared the box". */
  it('should emit zero for an x position left empty, on leaving the field', () => {
    const emitted: { property: string; value: unknown, isInputValid?: boolean | null }[] = [];
    component.updateModel.subscribe(update => emitted.push(update));
    const xInput = fixture.nativeElement.querySelector('input[type="number"]') as HTMLInputElement;

    xInput.value = '';
    xInput.dispatchEvent(new Event('input'));
    expect(emitted).toEqual([]); // still mid-edit, nothing written

    xInput.dispatchEvent(new Event('change'));

    expect(emitted).toEqual([{ property: 'xPosition', value: 0, isInputValid: true }]);
  });

  /* `gridRowRange` is declared `number` like the fields above, but it was left out of the first
     round of this fix: it emitted the raw value, sent no validity, and kept a `(change)` handler
     that patched `positionProperties` - the merged view object, not the element. The panel then
     showed 0 while the saved unit definition held null (#1154). */
  it('should emit zero for an emptied grid row range', async () => {
    unitServiceMock.unit.pages[0].sections[0].dynamicPositioning = true;
    const emitted: { property: string; value: unknown }[] = [];
    component.positionProperties = {
      gridRow: 1, gridRowRange: 2, gridColumn: 1, gridColumnRange: 2
    } as PositionProperties;
    fixture.detectChanges();
    await fixture.whenStable();
    component.updateModel.subscribe(update => emitted.push(update));

    const rangeInput = Array.from(
      fixture.nativeElement.querySelectorAll('input[type="number"]') as NodeListOf<HTMLInputElement>
    )[1];
    rangeInput.value = '';
    rangeInput.dispatchEvent(new Event('input'));
    rangeInput.dispatchEvent(new Event('change'));

    expect(emitted).toEqual([{ property: 'gridRowRange', value: 0 }]);
    expect(component.positionProperties.gridRowRange).toBe(2); // the view object is not written to
  });

  // Leaving a field that holds a number must not write it a second time.
  it('should not emit on leaving a field that has a value', () => {
    const emitted: unknown[] = [];
    const xInput = fixture.nativeElement.querySelector('input[type="number"]') as HTMLInputElement;
    xInput.value = '7';
    xInput.dispatchEvent(new Event('input'));
    component.updateModel.subscribe(update => emitted.push(update));

    xInput.dispatchEvent(new Event('change'));

    expect(emitted).toEqual([]);
  });

  /*
   * A multi-selection whose margins disagree merges the measurement's parts to null. The panel has
   * to see that null - substituting 0 here would let it write a margin nobody entered.
   */
  it('should pass a divergent margin on as null', () => {
    // The margin fields belong to the dynamic-positioning branch of the template.
    unitServiceMock.unit.pages[0].sections[0].dynamicPositioning = true;
    component.positionProperties = {
      ...component.positionProperties, marginTop: { value: null, unit: 'px' }
    } as typeof component.positionProperties;
    fixture.detectChanges();

    const topPanel = fixture.debugElement.queryAll(By.directive(MockSizeInputPanelComponent))
      .map(panel => panel.componentInstance as MockSizeInputPanelComponent)
      .find(panel => panel.label.includes('propertiesPanel.top'));

    expect(topPanel?.value).toBeNull();
    expect(topPanel?.unit).toBe('px');
  });

  it('should hide the z-index field when disabled', async () => {
    expect(fixture.nativeElement.textContent).toContain('propertiesPanel.zIndex');

    component.isZIndexDisabled = true;
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).not.toContain('propertiesPanel.zIndex');
  });
});
