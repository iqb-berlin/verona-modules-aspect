import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { MessageService } from 'common/services/message.service';
import { DragNDropValueObject, TextImageLabel } from 'common/models/elements/element';
import { CombinedProperties } from 'editor/src/app/components/properties-panel/element-properties-panel.component';
import { UnitService } from '../../../../services/unit.service';
import { SelectionService } from '../../../../services/selection.service';
import { DialogService } from '../../../../services/dialog.service';
import { IDService } from 'editor/src/app/services/id.service';

@Component({
  selector: 'aspect-drop-list-properties',
  template: `
    <div *ngIf="combinedProperties.type === 'drop-list' ||
                combinedProperties.type === 'drop-list-simple'"
                fxLayout="column">
      <aspect-option-list-panel [title]="'preset'" [textFieldLabel]="'Neue Option'"
                                [itemList]="$any(combinedProperties.value)"
                                (addItem)="addOption($event)"
                                (removeItem)="removeOption($event)"
                                (changedItemOrder)="moveOption('value', $event)"
                                (editItem)="editOption($event)">
      </aspect-option-list-panel>

      <mat-form-field *ngIf="combinedProperties.connectedTo !== null"
                      class="wide-form-field" appearance="fill"
                      (click)="generateValidDropLists()">
        <mat-label>{{'propertiesPanel.connectedDropLists' | translate }}</mat-label>
        <mat-select multiple [ngModel]="combinedProperties.connectedTo"
                    (ngModelChange)="toggleConnectedDropList($event)">
          <mat-select-trigger>
            {{'propertiesPanel.connectedDropLists' | translate }} ({{$any(combinedProperties.connectedTo).length}})
          </mat-select-trigger>
          <mat-option *ngFor="let id of dropListIDs" [value]="id">
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
                    (change)="updateModel.emit({ property: 'onlyOneItem', value: $event.checked })">
        {{'propertiesPanel.onlyOneItem' | translate }}
      </mat-checkbox>

      <mat-checkbox *ngIf="combinedProperties.copyOnDrop !== undefined"
                    [checked]="$any(combinedProperties.copyOnDrop)"
                    (change)="updateModel.emit({ property: 'copyOnDrop', value: $event.checked })">
        {{'propertiesPanel.copyOnDrop' | translate }}
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
  `
})
export class DropListPropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel = new EventEmitter<{
    property: string;
    value: string | number | boolean | string[] | DragNDropValueObject[],
    isInputValid?: boolean | null
  }>();

  dropListIDs: string[] = [];

  constructor(public unitService: UnitService,
              private selectionService: SelectionService,
              private dialogService: DialogService,
              private idManager: IDService,
              private messageService: MessageService,
              private translateService: TranslateService) { }

  notifyListChange(changedList: DragNDropValueObject[]): void {
    this.updateModel.emit({ property: 'value', value: changedList });
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
          id: this.unitService.getNewValueID()
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
    const oldOptions: DragNDropValueObject[] = this.combinedProperties.value as DragNDropValueObject[];

    await this.dialogService.showDropListOptionEditDialog(oldOptions[optionIndex])
      .subscribe((result: DragNDropValueObject) => {
        if (result) {
          if (result.id !== oldOptions[optionIndex].id && !this.idManager.isIdAvailable(result.id)) {
            this.messageService.showError(this.translateService.instant('idTaken'));
            return;
          }
          oldOptions[optionIndex] = result;
          this.updateModel.emit({ property: 'value', value: oldOptions });
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

  generateValidDropLists() {
    this.dropListIDs = this.unitService.getDropListElementIDs()
      .filter(dropListID => !this.combinedProperties.idList!.includes(dropListID));
  }
}
