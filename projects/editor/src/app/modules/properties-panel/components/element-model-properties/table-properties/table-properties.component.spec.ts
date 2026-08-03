import { UIElementProperties, Measurement } from 'common/models/ui-element-interfaces';
import {
  ComponentFixture, TestBed, fakeAsync, tick
} from '@angular/core/testing';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import {
  MergedCheckboxComponent
} from 'editor/src/app/modules/properties-panel/components/merged-checkbox/merged-checkbox.component';
import { ElementService } from 'editor/src/app/services/element.service';
import { MessageService } from 'editor/src/app/services/message.service';
import { UnitService } from 'editor/src/app/services/unit.service';
import {
  NumberFieldBadInputDirective
} from 'editor/modules/editor-shared/directives/number-field-bad-input.directive';
import { NumberFieldDirective } from 'editor/modules/editor-shared/directives/number-field.directive';
import {
  TablePropertiesComponent
} from './table-properties.component';

@Component({ selector: 'aspect-size-input-panel', standalone: false, template: '' })
class MockSizeInputPanelComponent {
  @Input() label!: string;
  @Input() value!: number;
  @Input() unit!: string;
  @Input() allowedUnits!: string[];
  @Output() valueUpdated = new EventEmitter<Measurement>();
}

describe('TablePropertiesComponent', () => {
  let component: TablePropertiesComponent;
  let fixture: ComponentFixture<TablePropertiesComponent>;
  let elementService: SpyObj<ElementService>;
  let messageService: SpyObj<MessageService>;
  let tablePropUpdated: Subject<string>;
  let emitted: { property: string; value: unknown }[];

  beforeEach(async () => {
    elementService = createSpyObj<ElementService>(['showDefaultEditDialog']);
    messageService = createSpyObj<MessageService>(['showError']);
    tablePropUpdated = new Subject<string>();

    await TestBed.configureTestingModule({
      declarations: [
        TablePropertiesComponent, MockSizeInputPanelComponent, MergedCheckboxComponent,
        NumberFieldDirective, NumberFieldBadInputDirective
      ],
      imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: ElementService, useValue: elementService },
        { provide: MessageService, useValue: messageService },
        { provide: UnitService, useValue: { tablePropUpdated } as unknown as UnitService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TablePropertiesComponent);
    component = fixture.componentInstance;
    component.combinedProperties = {
      type: 'table',
      elements: [
        { gridRow: 1, gridColumn: 1 },
        { gridRow: 2, gridColumn: 3 }
      ] as unknown as UIElementProperties[],
      gridRowSizes: [{ value: 1, unit: 'fr' }, { value: 1, unit: 'fr' }],
      gridColumnSizes: [{ value: 1, unit: 'fr' }, { value: 2, unit: 'fr' }, { value: 1, unit: 'fr' }],
      tableEdgesEnabled: false,
      headerEnabled: false
    };
    emitted = [];
    component.updateModel.subscribe(update => emitted.push(update));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should derive the minimum row and column count from the child elements', () => {
    expect(component.maxRowIndex).toBe(2);
    expect(component.maxColIndex).toBe(3);
  });

  it('should recalculate the maximum indices when a table property was updated', fakeAsync(() => {
    (component.combinedProperties.elements as unknown as { gridRow: number; gridColumn: number }[])
      .push({ gridRow: 5, gridColumn: 1 });

    tablePropUpdated.next('elements');
    tick();

    expect(component.maxRowIndex).toBe(5);
  }));

  it('should render a size input panel for every row and column', () => {
    expect(fixture.nativeElement.querySelectorAll('aspect-size-input-panel').length).toBe(5);
  });

  // A selection of tables whose grids disagree merges the size arrays to null. A count field would
  // then read 0 - a table claiming no rows - and editing it would reach into the absent array.
  it('should offer no grid editors when the size arrays diverge', () => {
    component.combinedProperties = {
      ...component.combinedProperties, elements: null, gridRowSizes: null, gridColumnSizes: null
    };
    component.calculateMaxIndices();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('fieldset').length).toBe(0);
    expect(fixture.nativeElement.querySelectorAll('aspect-size-input-panel').length).toBe(0);
    // The properties that do merge stay editable.
    expect(fixture.nativeElement.querySelectorAll('aspect-merged-checkbox').length).toBe(2);
  });

  it('should append new default sizes when the row count grows', () => {
    component.modifySizeArray('gridRowSizes', 3);

    expect(emitted).toEqual([{
      property: 'gridRowSizes',
      value: [{ value: 1, unit: 'fr' }, { value: 1, unit: 'fr' }, { value: 1, unit: 'fr' }]
    }]);
  });

  it('should cut off sizes when the column count shrinks', () => {
    component.modifySizeArray('gridColumnSizes', 1);

    expect(emitted).toEqual([{ property: 'gridColumnSizes', value: [{ value: 1, unit: 'fr' }] }]);
  });

  /* The two count fields go through `aspectNumberField` now, so these go through the boxes: what is
     left in the component is the decision what to do with a refusal, and the wiring is what used to
     be wrong. `min` is bound to the highest row or column a child element sits in. */
  describe('the count fields', () => {
    const rowCount = (): HTMLInputElement => fixture.nativeElement
      .querySelector('input[type="number"]') as HTMLInputElement;

    const edit = async (box: HTMLInputElement, value: string): Promise<void> => {
      box.value = value;
      box.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      box.dispatchEvent(new Event('blur'));
      fixture.detectChanges();
      await fixture.whenStable();
    };

    it('should take a count that clears the elements in the table', async () => {
      await edit(rowCount(), '3');

      expect(emitted).toEqual([{
        property: 'gridRowSizes',
        value: [{ value: 1, unit: 'fr' }, { value: 1, unit: 'fr' }, { value: 1, unit: 'fr' }]
      }]);
    });

    /* The row count may not drop below the last row that still holds an element. This worked before
       through `checkValidity()` and works now through the bound `min`. */
    it('should refuse a count that would drop an occupied row', async () => {
      await edit(rowCount(), '1');

      expect(emitted).toEqual([]);
      expect(messageService.showError).toHaveBeenCalledWith('propertiesPanel.sizeArrayNotEmptyRow');
      expect(rowCount().value).toBe('2');
    });

    /* Every two-digit entry passes through a single digit first. Applying that digit cut the size
       array down to it, and raising it again filled the gap with default tracks - so typing 12 over
       a 2 lost the second row's height. The count is applied on leaving the field now, which is
       where the original handler had it. */
    it('should not cut the size array while a two-digit count is being typed', async () => {
      component.combinedProperties = {
        ...component.combinedProperties,
        elements: [{ gridRow: 1, gridColumn: 1 }] as never,
        gridRowSizes: [{ value: 200, unit: 'px' }, { value: 300, unit: 'px' }]
      };
      component.calculateMaxIndices();
      fixture.detectChanges();
      await fixture.whenStable();

      rowCount().value = '1';
      rowCount().dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(emitted).toEqual([]); // nothing applied while it is being typed

      await edit(rowCount(), '12');

      expect(emitted.length).toBe(1);
      expect((emitted[0].value as { value: number; unit: string }[]).slice(0, 2))
        .toEqual([{ value: 200, unit: 'px' }, { value: 300, unit: 'px' }]);
    });

    /* And the hole that was left: an empty number input has no range underflow, so it passed
       `checkValidity()` as valid, and the size array was cut to nothing - every row of the table
       gone, silently and with no message (#1164). */
    it('should refuse an emptied count rather than drop every row', async () => {
      await edit(rowCount(), '');

      expect(emitted).toEqual([]);
      expect(messageService.showError).toHaveBeenCalledWith('inputInvalid');
      expect(rowCount().value).toBe('2');
    });
  });

  it('should emit the changed size of a single column', () => {
    component.changeGridSize('gridColumnSizes', 1, { value: 100, unit: 'px' });

    expect(emitted).toEqual([{
      property: 'gridColumnSizes',
      value: [{ value: 1, unit: 'fr' }, { value: 100, unit: 'px' }, { value: 1, unit: 'fr' }]
    }]);
  });

  it('should emit updateModel when the header checkbox is toggled', () => {
    const headerInput = Array.from(
      fixture.nativeElement.querySelectorAll('mat-checkbox input') as NodeListOf<HTMLInputElement>
    )[1];
    headerInput.click();

    expect(emitted).toEqual([{ property: 'headerEnabled', value: true }]);
  });

  it('should open the element edit dialog', () => {
    const editButton = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    editButton.click();

    expect(elementService.showDefaultEditDialog).toHaveBeenCalled();
  });
});
