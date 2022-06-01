import {
  Component, ElementRef, EventEmitter, Input, Output, ViewChild
} from '@angular/core';
import { UnitService } from '../../../../services/unit.service';
import { SelectionService } from '../../../../services/selection.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from 'common/services/message.service';
import { TranslateService } from '@ngx-translate/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop/drag-events';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { DragNDropValueObject } from 'common/models/elements/element';
import { IDManager } from 'common/util/id-manager';

@Component({
  selector: 'aspect-drop-list-properties',
  template: `
    <fieldset *ngIf="combinedProperties.type === 'drop-list' ||
                     combinedProperties.type === 'drop-list-sorting'">
      <legend>Ablegeliste</legend>

      <mat-form-field disabled="true" *ngIf="combinedProperties.type === 'drop-list' ||
                                           combinedProperties.type === 'drop-list-sorting'">
        <ng-container>
          <mat-label>{{'preset' | translate }}</mat-label>
          <div class="drop-list" cdkDropList [cdkDropListData]="combinedProperties.value"
               (cdkDropListDropped)="moveListValue($any($event))">
            <div *ngFor="let value of $any(combinedProperties.value); let i = index" cdkDrag
                 class="list-items" fxLayout="row" fxLayoutAlign="end center">
              <div fxFlex="70" class="draggable-element-label">
                {{value.stringValue}} ({{value.id}})
              </div>
              <img [src]="value.imgSrcValue"
                   [style.object-fit]="'scale-down'"
                   [style.height.px]="40">
              <button mat-icon-button color="primary"
                      (click)="editDropListOption(i)">
                <mat-icon>build</mat-icon>
              </button>
              <button mat-icon-button color="primary"
                      (click)="removeListValue('value', i)">
                <mat-icon>clear</mat-icon>
              </button>
            </div>
          </div>
        </ng-container>
        <div fxLayout="row" fxLayoutAlign="center center">
          <textarea matInput type="text" #newValue rows="2"
                    (keyup.enter)="addDropListOption(newValue.value); newValue.select()"></textarea>
          <button mat-icon-button
                  (click)="addDropListOption(newValue.value); newValue.select()">
            <mat-icon>add</mat-icon>
          </button>
        </div>
      </mat-form-field>

      <mat-form-field appearance="fill" *ngIf="combinedProperties.connectedTo !== null">
        <mat-label>{{'propertiesPanel.connectedDropLists' | translate }}</mat-label>
        <mat-select multiple [ngModel]="combinedProperties.connectedTo"
                    (ngModelChange)="toggleConnectedDropList($event)"
                    (click)="generateValidDropLists()">
          <mat-select-trigger>
            {{'propertiesPanel.connectedDropLists' | translate }} ({{combinedProperties.connectedTo.length}})
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
      <mat-form-field *ngIf="combinedProperties.highlightReceivingDropList"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.highlightReceivingDropListColor' | translate }}</mat-label>
        <input matInput type="text" [value]="$any(combinedProperties.highlightReceivingDropListColor)"
               (input)="updateModel.emit({
                     property: 'highlightReceivingDropListColor',
                     value: $any($event.target).value })">
      </mat-form-field>
    </fieldset>
  `,
  styles: [
    'mat-form-field {width: 100%;}',
    '.draggable-element-label {overflow-wrap: anywhere;}',
    'mat-select {height: 100%;}'
  ]
})
export class DropListPropertiesComponent {
  @Input() combinedProperties!: any;
  @Output() updateModel = new EventEmitter<{
    property: string;
    value: string | number | boolean | string[] | DragNDropValueObject[],
    isInputValid?: boolean | null
  }>();

  dropListIDs: string[] = [];

  constructor(public unitService: UnitService,
              private selectionService: SelectionService,
              private dialogService: DialogService,
              private messageService: MessageService,
              private translateService: TranslateService) { }

  addDropListOption(value: string): void {
    this.updateModel.emit({
      property: 'value',
      value: [
        ...this.combinedProperties.value as DragNDropValueObject[],
        { stringValue: value, id: this.unitService.getNewValueID() } // TODO direkt IDService
      ]
    });
  }

  async editDropListOption(optionIndex: number): Promise<void> {
    const oldOptions = this.combinedProperties.value;

    await this.dialogService.showDropListOptionEditDialog(oldOptions[optionIndex])
      .subscribe((result: DragNDropValueObject) => {
        if (result) {
          if (result.id !== oldOptions[optionIndex].id && !IDManager.getInstance().isIdAvailable(result.id)) {
            this.messageService.showError(this.translateService.instant('idTaken'));
            return;
          }
          oldOptions[optionIndex] = result;
          this.updateModel.emit({ property: 'value', value: oldOptions });
        }
      });
  }

  moveListValue(event: CdkDragDrop<string[]>): void {
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    this.updateModel.emit({ property: 'value', value: event.container.data });
  }

  removeListValue(property: string, optionIndex: number): void {
    const valueList = this.combinedProperties[property] as DragNDropValueObject[];
    valueList.splice(optionIndex, 1);
    this.updateModel.emit({ property: property, value: valueList });
  }

  toggleConnectedDropList(connectedDropListList: string[]) {
    this.updateModel.emit({
      property: 'connectedTo',
      value: connectedDropListList
    });
  }

  generateValidDropLists() {
    this.dropListIDs = this.unitService.getDropListElementIDs()
      .filter(dropListID => !this.combinedProperties.id.includes(dropListID));
  }
}
