import {
  Component, EventEmitter, Input, Output
} from '@angular/core';

@Component({
  selector: 'aspect-text-properties-field-set',
  template: `
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
  `,
  styles: [
  ]
})
export class TextPropertiesFieldSetComponent {
  @Input() combinedProperties!: any;
  @Output() updateModel =
  new EventEmitter<{ property: string; value: string | number | boolean | string[], isInputValid?: boolean | null }>();
}
