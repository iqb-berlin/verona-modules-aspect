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
    const elements = (this.combinedProperties.elements ?? []) as unknown as TableElement[];
    this.maxRowIndex = Math.max(...elements.map(el => el.gridRow), 1);
    this.maxColIndex = Math.max(...elements.map(el => el.gridColumn), 1);
  }

  /* Add or remove elements to size array. Default value 1fr. */
  modifySizeArray(property: 'gridColumnSizes' | 'gridRowSizes', newLength: number, event?: Event): void {
    if (!(event?.target as HTMLInputElement).checkValidity()) {
      (event as any).target.value = (this.combinedProperties[property] as unknown[]).length;
      this.messageService.showError(this.translateService.instant(
        property === 'gridColumnSizes' ?
          'propertiesPanel.sizeArrayNotEmptyColumn' :
          'propertiesPanel.sizeArrayNotEmptyRow'
      ));
      return;
    }
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
