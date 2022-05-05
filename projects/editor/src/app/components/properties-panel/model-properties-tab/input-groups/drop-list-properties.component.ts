import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { DragNDropValueObject, LikertRowElement, TextImageLabel } from 'common/interfaces/elements';
import { UnitService } from '../../../../../../services/unit.service';
import { SelectionService } from '../../../../../../services/selection.service';
import { DialogService } from '../../../../../../services/dialog.service';
import { IDService } from 'common/services/id.service';
import { MessageService } from 'common/services/message.service';
import { TranslateService } from '@ngx-translate/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop/drag-events';
import { moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'aspect-drop-list-properties',
  template: `
    <mat-form-field disabled="true" *ngIf="combinedProperties.type === 'drop-list' ||
                                         combinedProperties.type === 'drop-list-sorting'">
      <ng-container>
        <mat-label>{{'preset' | translate }}</mat-label>
        <div class="drop-list" cdkDropList [cdkDropListData]="combinedProperties.value"
             (cdkDropListDropped)="moveListValue($any($event))">
          <div *ngFor="let value of $any(combinedProperties.value); let i = index" cdkDrag
               class="list-items" fxLayout="row" fxLayoutAlign="end center">
            <div fxFlex="70">
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
                    (click)="removeListValue(i)">
              <mat-icon>clear</mat-icon>
            </button>
          </div>
        </div>
      </ng-container>
      <div fxLayout="row" fxLayoutAlign="center center">
        <button mat-icon-button matPrefix
                (click)="addDropListOption(newValue.value); newValue.select()">
          <mat-icon>add</mat-icon>
        </button>
        <input #newValue matInput type="text"
               (keyup.enter)="addDropListOption(newValue.value); newValue.select()">
      </div>
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
  `,
  styles: [
    'mat-form-field {width: 100%;}'
  ]
})
export class DropListPropertiesComponent {
  @Input() combinedProperties!: any;
  @Output() updateModel = new EventEmitter<{
    property: string;
    value: string | number | boolean | string[] | DragNDropValueObject[],
    isInputValid?: boolean | null
  }>();

  constructor(private unitService: UnitService,
              private selectionService: SelectionService,
              private dialogService: DialogService,
              private idService: IDService,
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
          if (result.id !== oldOptions[optionIndex].id && !this.idService.isIdAvailable(result.id)) {
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

  removeListValue(optionIndex: number): void {
    const valueList = this.combinedProperties.value as DragNDropValueObject[];
    valueList.splice(optionIndex, 1);
    this.updateModel.emit({ property: 'value', value: valueList });
  }
}
