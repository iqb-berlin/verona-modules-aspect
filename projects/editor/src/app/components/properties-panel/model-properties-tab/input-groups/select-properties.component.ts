import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CombinedProperties } from 'editor/src/app/components/properties-panel/element-properties-panel.component';

@Component({
  selector: 'aspect-select-properties',
  template: `
    <mat-checkbox *ngIf="combinedProperties.strikeOtherOptions !== undefined"
                  [checked]="$any(combinedProperties.strikeOtherOptions)"
                  (change)="updateModel.emit({ property: 'strikeOtherOptions', value: $event.checked })">
      {{'propertiesPanel.strikeOtherOptions' | translate }}
    </mat-checkbox>
    <mat-checkbox *ngIf="combinedProperties.strikeSelectedOption !== undefined"
                  [checked]="$any(combinedProperties.strikeSelectedOption)"
                  (change)="updateModel.emit({ property: 'strikeSelectedOption', value: $event.checked })">
      {{'propertiesPanel.strikeSelectedOption' | translate }}
    </mat-checkbox>
    <mat-checkbox *ngIf="combinedProperties.allowUnset !== undefined"
                  [checked]="$any(combinedProperties.allowUnset)"
                  (change)="updateModel.emit({ property: 'allowUnset', value: $event.checked })">
      {{'propertiesPanel.allowUnset' | translate }}
    </mat-checkbox>
  `,
  styles: [
  ]
})
export class SelectPropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel =
    new EventEmitter<{
      property: string,
      value: string | number | boolean | string[]
    }>();
}
