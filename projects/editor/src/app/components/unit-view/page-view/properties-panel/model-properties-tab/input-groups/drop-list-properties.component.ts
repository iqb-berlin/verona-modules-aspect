import {
  Component, EventEmitter, Input, Output
} from '@angular/core';

@Component({
  selector: 'aspect-drop-list-properties',
  template: `
    <mat-checkbox *ngIf="combinedProperties.onlyOneItem !== undefined"
                  [checked]="$any(combinedProperties.onlyOneItem)"
                  (change)="updateModel.emit({ property: 'onlyOneItem', value: $event.checked })">
      {{'propertiesPanel.onlyOneItem' | translate }}
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
  ]
})
export class DropListPropertiesComponent {
  @Input() combinedProperties!: any;
  @Output() updateModel =
  new EventEmitter<{ property: string; value: string | number | boolean | string[], isInputValid?: boolean | null }>();
}
