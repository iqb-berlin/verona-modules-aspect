import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
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
import { NumberFieldDirective } from 'editor/modules/editor-shared/directives/number-field.directive';
import {
  MergedMarkerComponent
} from 'editor/src/app/modules/properties-panel/components/merged-marker/merged-marker.component';

@Component({
  selector: 'aspect-size-input-panel',
  standalone: false,
  template: ''
})
class MockSizeInputPanelComponent {
  @Input() min: number | null = null;
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
      declarations: [PositionFieldSetComponent, MockSizeInputPanelComponent, NumberFieldDirective,
        MergedMarkerComponent
      ],
      imports: [
        MatIconModule,
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
     back into the box through the model, stamping over what is being typed. The z-index carries no
     `min`, so a negative value is legitimate and has to survive being typed. */
  it('should let a negative number be typed into the z-index', async () => {
    const emitted: { property: string; value: unknown }[] = [];
    component.positionProperties = { xPosition: 10, yPosition: 20, zIndex: 3 } as PositionProperties;
    fixture.detectChanges();
    await fixture.whenStable();
    component.updateModel.subscribe(update => emitted.push(update));
    const zInput = Array.from(
      fixture.nativeElement.querySelectorAll('input[type="number"]') as NodeListOf<HTMLInputElement>
    ).at(-1) as HTMLInputElement;

    // First keystroke of "-2": the browser cannot parse "-", the accessor reports null.
    zInput.value = '';
    zInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(emitted).toEqual([]); // a 0 written here would come back and overwrite the "-"

    zInput.value = '-2';
    zInput.dispatchEvent(new Event('input'));

    expect(emitted).toEqual([{ property: 'zIndex', value: -2, isInputValid: true }]);
  });

  /* `xPosition` is declared `number`, so an emptied field must not send null down the write path -
     that is how null reached the saved unit definition (#1154). The box is `required`, so an empty
     one is refused like a negative value: nothing is written and the host warns (#1161).

     Note the contrast with the margin test below, where null is the right answer: there it means
     "the selected elements disagree", here it means "the user cleared the box". */
  it('should refuse an x position left empty', async () => {
    const emitted: { property: string; value: unknown, isInputValid?: boolean | null }[] = [];
    component.updateModel.subscribe(update => emitted.push(update));
    const xInput = fixture.nativeElement.querySelector('input[type="number"]') as HTMLInputElement;

    xInput.value = '';
    xInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(emitted).toEqual([]); // still mid-edit, nothing written

    xInput.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(emitted).toEqual([{ property: 'xPosition', value: null, isInputValid: false }]);
    expect(xInput.value).toBe('10'); // and the box shows what is saved again
  });

  /* `gridRowRange` is declared `number` like the fields above, but it was left out of the first
     round of this fix: it emitted the raw value, sent no validity, and kept a `(change)` handler
     that patched `positionProperties` - the merged view object, not the element. The panel then
     showed 0 while the saved unit definition held null (#1154).

     It carries `min="1"` on top of `required`: a range counts a span, and the consumers render
     `grid-row: N / (N + range)`, so a stored 0 collapses to `auto` and the layout would show a
     span of 1 while the unit definition claimed 0. */
  it('should refuse an emptied grid row range', async () => {
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
    fixture.detectChanges();
    rangeInput.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(emitted).toEqual([{ property: 'gridRowRange', value: null, isInputValid: false }]);
    expect(rangeInput.value).toBe('2');
    expect(component.positionProperties.gridRowRange).toBe(2); // the view object is not written to
  });

  /* And a zero, which the box takes without `min="1"` and which reaches the model as a span the
     layout cannot show: `grid-row: N / N` collapses to `auto`, one row, over a definition claiming
     none. */
  it('should refuse a grid row range of zero', async () => {
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
    rangeInput.value = '0';
    rangeInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    rangeInput.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(emitted).toEqual([{ property: 'gridRowRange', value: 0, isInputValid: false }]);
    expect(rangeInput.value).toBe('2');
  });

  /* Now that the guard in the host actually rejects invalid input, the box must not keep showing a
     number that was never saved. `min="0"` makes -5 invalid, nothing is written while it is typed,
     and on leaving the field the box goes back to the model value.

     The one emit is what makes the host warn. It carries `isInputValid: false`, so it is a report,
     not a write - and it happens here rather than on the keystroke, or typing `-50` would warn
     twice on its way through `-5`. */
  it('should report a rejected value once and put the box back', async () => {
    const emitted: unknown[] = [];
    const xInput = fixture.nativeElement.querySelector('input[type="number"]') as HTMLInputElement;
    component.updateModel.subscribe(update => emitted.push(update));
    ['-5', '-50'].forEach(value => {
      xInput.value = value;
      xInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();
    });
    expect(emitted).toEqual([]); // nothing at all while it is being typed

    xInput.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(xInput.value).toBe('10');
    expect(emitted).toEqual([{ property: 'xPosition', value: -50, isInputValid: false }]);
  });

  // Leaving a field that holds a number must not write it a second time.
  it('should not emit on leaving a field that has a value', () => {
    const emitted: unknown[] = [];
    const xInput = fixture.nativeElement.querySelector('input[type="number"]') as HTMLInputElement;
    xInput.value = '7';
    xInput.dispatchEvent(new Event('input'));
    component.updateModel.subscribe(update => emitted.push(update));

    xInput.dispatchEvent(new Event('blur'));

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
