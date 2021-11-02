import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { UIElement } from '../../../../../../common/models/uI-element';

@Component({
  selector: 'app-element-style-properties',
  template: `
    <div fxLayout="column">
      <mat-form-field *ngIf="combinedProperties.backgroundColor"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>Hintergrundfarbe</mat-label>
        <input matInput type="color" [value]="combinedProperties.backgroundColor"
               (input)="updateModel.emit({ property: 'backgroundColor', value: $any($event.target).value })">
      </mat-form-field>
      <mat-form-field *ngIf="combinedProperties.backgroundColor"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>Hintergrundfarbe</mat-label>
        <input matInput type="text" [value]="combinedProperties.backgroundColor"
               (input)="updateModel.emit({ property: 'backgroundColor', value: $any($event.target).value })">
      </mat-form-field>
      <mat-form-field *ngIf="combinedProperties.fontColor"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>Schriftfarbe</mat-label>
        <input matInput type="color" [value]="combinedProperties.fontColor"
               (input)="updateModel.emit({ property: 'fontColor', value: $any($event.target).value })">
      </mat-form-field>
      <mat-form-field *ngIf="combinedProperties.font != null"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>Schriftart</mat-label>
        <input matInput type="text" [value]="combinedProperties.font"
               (input)="updateModel.emit({ property: 'font', value: $any($event.target).value })">
      </mat-form-field>
      <mat-form-field *ngIf="combinedProperties.fontSize != null"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>Schriftgröße</mat-label>
        <input matInput type="number" #fontSize="ngModel" min="0"
               [ngModel]="combinedProperties.fontSize"
               (ngModelChange)="updateModel.emit({ property: 'fontSize',
                                                   value: $event,
                                                   isInputValid: fontSize.valid && $event !== null})">
      </mat-form-field>
      <mat-form-field *ngIf="combinedProperties.lineHeight != null"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>Zeilenhöhe</mat-label>
        <input matInput type="number" #lineHeight="ngModel" min="0"
               [ngModel]="combinedProperties.lineHeight"
               (ngModelChange)="updateModel.emit({ property: 'lineHeight',
                                                   value: $event,
                                                   isInputValid: lineHeight.valid && $event !== null })">
      </mat-form-field>

      <mat-checkbox *ngIf="combinedProperties.bold != null"
                    [checked]="$any(combinedProperties.bold)"
                    (change)="updateModel.emit({ property: 'bold', value: $event.checked })">
        Fett
      </mat-checkbox>
      <mat-checkbox *ngIf="combinedProperties.italic != null"
                    [checked]="$any(combinedProperties.italic)"
                    (change)="updateModel.emit({ property: 'italic', value: $event.checked })">
        Kursiv
      </mat-checkbox>
      <mat-checkbox *ngIf="combinedProperties.underline != null"
                    [checked]="$any(combinedProperties.underline)"
                    (change)="updateModel.emit({ property: 'underline', value: $event.checked })">
        Unterstrichen
      </mat-checkbox>
    </div>
  `
})
export class ElementStylePropertiesComponent {
  @Input() combinedProperties: UIElement = {} as UIElement;
  @Output() updateModel = new EventEmitter<{ property: string; value: string | boolean, isInputValid?: boolean | null }>();
}
