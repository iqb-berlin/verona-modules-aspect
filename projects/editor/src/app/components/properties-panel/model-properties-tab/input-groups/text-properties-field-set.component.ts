import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { TextElement } from 'common/models/elements/text/text';
import { DialogService } from '../../../../services/dialog.service';
import { SelectionService } from '../../../../services/selection.service';

@Component({
  selector: 'aspect-text-properties-field-set',
  template: `
    <div *ngIf="combinedProperties.text" fxLayout="column">
      <ng-container>
        <div class="text-text"
             [innerHTML]="$any(combinedProperties.text) | safeResourceHTML"
             (click)="showTextEditDialog()">
        </div>
      </ng-container>
      <mat-form-field *ngIf="combinedProperties.columnCount != null"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.columnCount' | translate }}</mat-label>
        <input matInput type="number" [value]="$any(combinedProperties.columnCount)"
               (input)="updateModel.emit({ property: 'columnCount', value: $any($event.target).value })">
      </mat-form-field>
      <div *ngIf="combinedProperties.highlightableYellow !== undefined ||
                combinedProperties.highlightableTurquoise !== undefined ||
                combinedProperties.highlightableOrange !== undefined">
        {{'propertiesPanel.highlightable' | translate }}</div>
      <mat-checkbox *ngIf="combinedProperties.highlightableYellow !== undefined"
                    [checked]="$any(combinedProperties.highlightableYellow)"
                    (change)="updateModel.emit({ property: 'highlightableYellow', value: $event.checked })">
        {{'propertiesPanel.highlightableYellow' | translate }}
      </mat-checkbox>
      <mat-checkbox *ngIf="combinedProperties.highlightableTurquoise !== undefined"
                    [checked]="$any(combinedProperties.highlightableTurquoise)"
                    (change)="updateModel.emit({ property: 'highlightableTurquoise', value: $event.checked })">
        {{'propertiesPanel.highlightableTurquoise' | translate }}
      </mat-checkbox>
      <mat-checkbox *ngIf="combinedProperties.highlightableOrange !== undefined"
                    [checked]="$any(combinedProperties.highlightableOrange)"
                    (change)="updateModel.emit({ property: 'highlightableOrange', value: $event.checked })">
        {{'propertiesPanel.highlightableOrange' | translate }}
      </mat-checkbox>
    </div>
  `,
  styles: [
    '.text-text {min-height: 125px; max-height: 400px; overflow: auto;}',
    '.text-text {background-color: rgba(0,0,0,.04); cursor: pointer; margin-bottom: 10px;}'
  ]
})
export class TextPropertiesFieldSetComponent {
  @Input() combinedProperties!: any;
  @Output() updateModel =
    new EventEmitter<{ property: string; value: string | number | boolean | string[], isInputValid?: boolean | null }>();

  constructor(public dialogService: DialogService, public selectionService: SelectionService) {}

  showTextEditDialog(): void {
    const selectedElement = this.selectionService.getSelectedElements()[0];
    this.dialogService.showRichTextEditDialog(
      (selectedElement as TextElement).text,
      (selectedElement as TextElement).styling.fontSize
    ).subscribe((result: string) => {
      if (result) {
        this.updateModel.emit({ property: 'text', value: result });
      }
    });
  }
}
