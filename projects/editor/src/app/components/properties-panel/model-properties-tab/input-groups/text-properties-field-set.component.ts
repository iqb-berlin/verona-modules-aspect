import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { TextElement } from 'common/models/elements/text/text';
import { DialogService } from '../../../../services/dialog.service';
import { SelectionService } from '../../../../services/selection.service';

@Component({
  selector: 'aspect-text-properties-field-set',
  template: `
    <div *ngIf="combinedProperties.text" class="fx-column-start-stretch">
      Text
      <div class="text-text"
           [innerHTML]="combinedProperties.text | safeResourceHTML">
      </div>
      <button mat-fab color="primary" [style.align-self]="'center'" [style.margin-bottom.px]="20"
              [matTooltip]="'Text bearbeiten'"
              (click)="showTextEditDialog()">
        <mat-icon>edit</mat-icon>
      </button>
      <mat-form-field *ngIf="combinedProperties.columnCount != null"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.columnCount' | translate }}</mat-label>
        <input matInput type="number" [value]="$any(combinedProperties.columnCount)"
               (input)="updateModel.emit({ property: 'columnCount', value: $any($event.target).value })"
               (change)="combinedProperties.columnCount = combinedProperties.columnCount ?
                                                            combinedProperties.columnCount : 0">
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
      <mat-checkbox *ngIf="combinedProperties.hasSelectionPopup !== undefined"
                    [disabled]="!combinedProperties.highlightableYellow &&
                    !combinedProperties.highlightableTurquoise &&
                    !combinedProperties.highlightableOrange"
                    [style.margin-top.px]="5"
                    [checked]="$any(combinedProperties.hasSelectionPopup)"
                    (change)="updateModel.emit({ property: 'hasSelectionPopup', value: $event.checked })">
        {{'propertiesPanel.hasSelectionPopup' | translate }}
      </mat-checkbox>
    </div>
  `,
  styles: [`
    .text-text {
      margin-bottom: 10px;
      padding: 10px;
      max-height: 200px;
      overflow: scroll;
    }
    .fx-column-start-stretch {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: stretch;
    }
  `]
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
