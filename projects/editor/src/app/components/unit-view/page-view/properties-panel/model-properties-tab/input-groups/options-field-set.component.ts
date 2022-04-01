import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop/drag-events';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { DialogService } from '../../../../../../services/dialog.service';

@Component({
  selector: 'aspect-options-field-set',
  template: `
    <mat-form-field disabled="true" *ngIf="combinedProperties.options !== undefined">
      <ng-container>
        <mat-label>{{'propertiesPanel.options' | translate }}</mat-label>
        <div class="drop-list" cdkDropList [cdkDropListData]="combinedProperties.options"
             (cdkDropListDropped)="reorderOptions('options', $any($event))">
          <div *ngFor="let option of $any(combinedProperties.options); let i = index" cdkDrag
               fxLayout="row" fxLayoutAlign="end center">
            <div fxFlex="70">
              {{option}}
            </div>
            <button mat-icon-button color="primary"
                    (click)="editTextOption('options', i)">
              <mat-icon>build</mat-icon>
            </button>
            <button mat-icon-button color="primary"
                    (click)="removeOption('options', option)">
              <mat-icon>clear</mat-icon>
            </button>
          </div>
        </div>
      </ng-container>
      <div fxLayout="row" fxLayoutAlign="center center">
        <button mat-icon-button matPrefix
                (click)="addOption('options', newOption.value); newOption.select()">
          <mat-icon>add</mat-icon>
        </button>
        <input #newOption matInput type="text" placeholder="Optionstext"
               (keyup.enter)="addOption('options', newOption.value); newOption.select()">
      </div>
    </mat-form-field>
  `,
  styles: [
    '.mat-form-field {width: 100%;}'
  ]
})
export class OptionsFieldSetComponent {
  @Input() combinedProperties!: any;
  @Output() updateModel =
  new EventEmitter<{ property: string; value: string | number | boolean | string[], isInputValid?: boolean | null }>();

  constructor(public dialogService: DialogService) { }

  addOption(property: string, value: string): void {
    this.updateModel.emit({
      property: property,
      value: [...(this.combinedProperties[property] as string[]), value]
    });
  }

  removeOption(property: string, option: any): void {
    const valueList = this.combinedProperties[property] as string[];
    valueList.splice(valueList.indexOf(option), 1);
    this.updateModel.emit({ property: property, value: valueList });
  }

  async editTextOption(property: string, optionIndex: number): Promise<void> {
    const oldOptions = this.combinedProperties[property] as string[];
    await this.dialogService.showTextEditDialog(oldOptions[optionIndex])
      .subscribe((result: string) => {
        if (result) {
          oldOptions[optionIndex] = result;
          this.updateModel.emit({ property, value: oldOptions });
        }
      });
  }

  reorderOptions(property: string, event: CdkDragDrop<string[]>): void {
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    this.updateModel.emit({ property: property, value: event.container.data });
  }
}
