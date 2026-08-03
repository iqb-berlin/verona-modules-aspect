import {
  Component, EventEmitter, Input, OnDestroy, OnInit, Output
} from '@angular/core';
import { ElementService } from 'editor/src/app/services/element.service';
import { MessageService } from 'editor/src/app/services/message.service';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { UnitService } from 'editor/src/app/services/unit.service';
import { Subject } from 'rxjs';
import { UIElement } from 'common/models/elements/element';
import { TableProperties } from 'common/models/elements/compound-group-elements/table/table';
import { Merged } from 'editor/src/app/modules/properties-panel/models/merged-properties';

@Component({
  selector: 'aspect-table-properties',
  standalone: false,
  templateUrl: './table-properties.component.html',
  styleUrls: ['./table-properties.component.scss']
})
export class TablePropertiesComponent implements OnInit, OnDestroy {
  @Input() combinedProperties!: Merged<TableProperties>;
  @Output() updateModel =
    new EventEmitter<{ property: keyof TableProperties; value: boolean | { value: number; unit: string }[] | null }>();

  private ngUnsubscribe = new Subject<void>();

  maxRowIndex!: number;
  maxColIndex!: number;

  /** The last valid entry per count box, applied when that field is left. */
  private pendingCount: Partial<Record<'gridColumnSizes' | 'gridRowSizes', number>> = {};

  constructor(public elementService: ElementService,
              private messageService: MessageService,
              private unitService: UnitService,
              private translateService: TranslateService) { }

  ngOnInit(): void {
    this.unitService.tablePropUpdated
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        () => {
          // Wait for updated properties
          setTimeout(() => this.calculateMaxIndices());
        }
      );
    this.calculateMaxIndices();
  }

  calculateMaxIndices(): void {
    // `?? []` is safe here, unlike in a value binding: the indices are only the lower bound of the
    // count fields, and a selection whose children disagree (merging `elements` to null) is not
    // offered those fields at all.
    const elements = (this.combinedProperties.elements ?? []) as unknown as TableElement[];
    this.maxRowIndex = Math.max(...elements.map(el => el.gridRow), 1);
    this.maxColIndex = Math.max(...elements.map(el => el.gridColumn), 1);
  }

  /**
   * What `aspectNumberField` worked out for one of the two count fields.
   *
   * The guard used to be written out here, reading `checkValidity()` off the event and putting the
   * box back by hand. It caught a count below `min` - a row that still holds elements - but not an
   * emptied box: an empty number input has no range underflow, so it passed as valid and the whole
   * size array was cut to nothing, silently and without a message (#1164).
   *
   * `required` closes that, and the two refusals want different words. `min` is about this table -
   * the row you are trying to drop still has something in it - while an empty box is simply not a
   * count. They are told apart by the value: a box refused for being empty carries null.
   */
  commitCount(property: 'gridColumnSizes' | 'gridRowSizes',
              update: { value: number | null; isInputValid: boolean }): void {
    if (!update.isInputValid || update.value === null) {
      this.messageService.showError(this.translateService.instant(
        // eslint-disable-next-line no-nested-ternary
        update.value === null ? 'inputInvalid' :
          (property === 'gridColumnSizes' ?
            'propertiesPanel.sizeArrayNotEmptyColumn' :
            'propertiesPanel.sizeArrayNotEmptyRow')
      ));
      delete this.pendingCount[property];
      return;
    }
    this.pendingCount[property] = update.value;
  }

  /**
   * The count is applied on leaving the field, not on the keystroke.
   *
   * Every two-digit entry passes through a single digit first, and applying that digit cuts the
   * size array down to it - so typing 12 over a 2 dropped the second row's height and came back
   * with ten default tracks instead. The original handler was on `(change)`, i.e. here; the
   * migration is what moved it to the keystroke (#1164).
   *
   * The directive's own blur listener runs first (measured), so a refused entry has already cleared
   * what was pending by the time this asks.
   */
  applyCount(property: 'gridColumnSizes' | 'gridRowSizes'): void {
    const pending = this.pendingCount[property];
    if (pending === undefined) return;
    delete this.pendingCount[property];
    this.modifySizeArray(property, pending);
  }

  /* Add or remove elements to size array. Default value 1fr. */
  modifySizeArray(property: 'gridColumnSizes' | 'gridRowSizes', newLength: number): void {
    const sizeArray: { value: number; unit: string }[] = property === 'gridColumnSizes' ?
      (this.combinedProperties.gridColumnSizes as { value: number; unit: string }[]) :
      (this.combinedProperties.gridRowSizes as { value: number; unit: string }[]);

    let newArray: { value: number; unit: string }[] = [];
    if (newLength < sizeArray.length) {
      newArray = sizeArray.slice(0, newLength);
    } else {
      newArray.push(
        ...sizeArray,
        ...Array(newLength - sizeArray.length).fill({ value: 1, unit: 'fr' })
      );
    }
    this.updateModel.emit({ property, value: newArray });
  }

  changeGridSize(property: keyof TableProperties, index: number, newValue: { value: number; unit: string }): void {
    const sizeArray: { value: number; unit: string }[] = property === 'gridColumnSizes' ?
      (this.combinedProperties.gridColumnSizes as { value: number; unit: string }[]) :
      (this.combinedProperties.gridRowSizes as { value: number; unit: string }[]);
    sizeArray[index] = newValue;
    this.updateModel.emit({ property, value: [...sizeArray] });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

interface TableElement extends UIElement {
  gridRow: number;
  gridColumn: number;
}
