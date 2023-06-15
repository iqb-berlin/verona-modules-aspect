// eslint-disable-next-line max-classes-per-file
import {
  Component, EventEmitter, Input, Output, Pipe, PipeTransform
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { MessageService } from 'common/services/message.service';
import { CombinedProperties } from 'editor/src/app/components/properties-panel/element-properties-panel.component';
import { IDService } from 'editor/src/app/services/id.service';
import { UnitService } from '../../../../services/unit.service';
import { SelectionService } from '../../../../services/selection.service';
import { DialogService } from '../../../../services/dialog.service';

import { DragNDropValueObject, TextImageLabel } from 'common/models/elements/label-interfaces';

@Component({
  selector: 'aspect-drop-list-properties',
  template: `
    <div *ngIf="combinedProperties.type === 'drop-list'"
         class="fx-column-start-stretch">
      <aspect-option-list-panel [title]="'preset'" [textFieldLabel]="'Neue Option'"
                                [itemList]="$any(combinedProperties.value)"
                                (addItem)="addOption($event)"
                                (removeItem)="removeOption($event)"
                                (changedItemOrder)="moveOption('value', $event)"
                                (editItem)="editOption($event)">
      </aspect-option-list-panel>

      <mat-form-field *ngIf="combinedProperties.connectedTo !== null"
                      class="wide-form-field" appearance="fill">
        <mat-label>{{'propertiesPanel.connectedDropLists' | translate }}</mat-label>
        <mat-select multiple [ngModel]="combinedProperties.connectedTo"
                    (ngModelChange)="toggleConnectedDropList($event)">
          <mat-select-trigger>
            {{'propertiesPanel.connectedDropLists' | translate }} ({{$any(combinedProperties.connectedTo).length}})
          </mat-select-trigger>
          <mat-option *ngFor="let id of (combinedProperties.idList | getValidDropLists)" [value]="id">
            {{id}}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field *ngIf="combinedProperties.orientation !== undefined"
                      appearance="fill">
        <mat-label>{{'propertiesPanel.alignment' | translate }}</mat-label>
        <mat-select [value]="combinedProperties.orientation"
                    (selectionChange)="updateModel.emit({ property: 'orientation', value: $event.value })">
          <mat-option *ngFor="let option of ['vertical', 'horizontal', 'flex']"
                      [value]="option">
            {{ 'propertiesPanel.' + option | translate }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <mat-checkbox *ngIf="combinedProperties.onlyOneItem !== undefined"
                    [checked]="$any(combinedProperties.onlyOneItem)"
                    (change)="updateOnlyOneItem($event.checked)">
        {{'propertiesPanel.onlyOneItem' | translate }}
      </mat-checkbox>

      <mat-checkbox *ngIf="combinedProperties.allowReplacement !== undefined"
                    [checked]="$any(combinedProperties.allowReplacement)"
                    (change)="updateAllowReplacement($event.checked)">
        {{'allowReplacement' | translate }}
      </mat-checkbox>

      <mat-checkbox *ngIf="combinedProperties.copyOnDrop !== undefined"
                    [checked]="$any(combinedProperties.copyOnDrop)"
                    (change)="updateModel.emit({ property: 'copyOnDrop', value: $event.checked })">
        {{'propertiesPanel.copyOnDrop' | translate }}
      </mat-checkbox>

      <mat-checkbox *ngIf="combinedProperties.deleteDroppedItemWithSameID !== undefined"
                    matTooltip="{{'propertiesPanel.deleteDroppedItemWithSameIDTooltip' | translate }}"
                    [disabled]="!combinedProperties.copyOnDrop"
                    [checked]="$any(combinedProperties.deleteDroppedItemWithSameID)"
                    (change)="updateModel.emit({ property: 'deleteDroppedItemWithSameID', value: $event.checked })">
        {{'propertiesPanel.deleteDroppedItemWithSameID' | translate }}
      </mat-checkbox>

      <mat-checkbox *ngIf="combinedProperties.highlightReceivingDropList !== undefined"
                    [checked]="$any(combinedProperties.highlightReceivingDropList)"
                    (change)="updateModel.emit({ property: 'highlightReceivingDropList', value: $event.checked })">
        {{'propertiesPanel.highlightReceivingDropList' | translate }}
      </mat-checkbox>
      <mat-form-field appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.highlightReceivingDropListColor' | translate }}</mat-label>
        <input matInput type="text"
               [disabled]="!combinedProperties.highlightReceivingDropList"
               [value]="$any(combinedProperties.highlightReceivingDropListColor)"
               (input)="updateModel.emit({
                     property: 'highlightReceivingDropListColor',
                     value: $any($event.target).value })">
      </mat-form-field>
    </div>
  `,
  styles: [`
    .fx-column-start-stretch {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: stretch;
    }
  `]
})
export class DropListPropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel = new EventEmitter<{
    property: string;
    value: string | number | boolean | string[] | DragNDropValueObject[],
    isInputValid?: boolean | null
  }>();

  constructor(public unitService: UnitService,
              private selectionService: SelectionService,
              private dialogService: DialogService,
              private idManager: IDService,
              private messageService: MessageService,
              private translateService: TranslateService) { }

  notifyListChange(changedList: DragNDropValueObject[]): void {
    this.updateModel.emit({ property: 'value', value: changedList });
  }

  updateAllowReplacement(value: boolean) {
    if (value) this.updateOnlyOneItem(true);
    this.updateModel.emit({ property: 'allowReplacement', value });
  }

  updateOnlyOneItem(value: boolean) {
    if (!value) this.updateAllowReplacement(false);
    this.updateModel.emit({ property: 'onlyOneItem', value });
  }

  addOption(value: string): void {
    this.updateModel.emit({
      property: 'value',
      value: [
        ...this.combinedProperties.value as DragNDropValueObject[],
        {
          text: value,
          imgSrc: null,
          imgPosition: 'above',
          id: this.unitService.getNewValueID(),
          originListID: 'id_placeholder',
          originListIndex: 0
        }
      ]
    });
  }

  moveOption(property: string, indices: { previousIndex: number, currentIndex: number }): void {
    moveItemInArray(this.combinedProperties[property] as TextImageLabel[],
      indices.previousIndex,
      indices.currentIndex);
    this.updateModel.emit({ property: property, value: this.combinedProperties[property] as DragNDropValueObject[] });
  }

  async editOption(optionIndex: number): Promise<void> {
    const dropListValues: DragNDropValueObject[] = this.combinedProperties.value as DragNDropValueObject[];

    await this.dialogService.showDropListOptionEditDialog(dropListValues[optionIndex])
      .subscribe((result: DragNDropValueObject) => {
        if (result) {
          if (result.id !== dropListValues[optionIndex].id && !this.idManager.isIdAvailable(result.id)) {
            this.messageService.showError(this.translateService.instant('idTaken'));
            return;
          }
          dropListValues[optionIndex] = result;
          this.updateModel.emit({ property: 'value', value: dropListValues });
        }
      });
  }

  removeOption(optionIndex: number): void {
    const valueList = this.combinedProperties.value as DragNDropValueObject[];
    valueList.splice(optionIndex, 1);
    this.updateModel.emit({ property: 'value', value: valueList });
  }

  toggleConnectedDropList(connectedDropListList: string[]) {
    this.updateModel.emit({
      property: 'connectedTo',
      value: connectedDropListList
    });
  }
}

@Pipe({
  name: 'getValidDropLists'
})
export class GetValidDropListsPipe implements PipeTransform {
  constructor(private unitService: UnitService) {}

  transform(idList: string[] | undefined): string[] {
    if (!idList) return [];
    return this.unitService.getAllDropListElementIDs()
      .filter(dropListID => !idList.includes(dropListID));
  }
}
