import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CombinedProperties } from 'editor/src/app/components/properties-panel/element-properties-panel.component';

@Component({
  selector: 'aspect-input-assistance-properties',
  template: `
    <fieldset *ngIf="combinedProperties.showSoftwareKeyboard !== undefined" class="fx-column-start-stretch">
      <legend>Eingabehilfe</legend>
      <mat-checkbox [checked]="$any(combinedProperties.showSoftwareKeyboard)"
                    (change)="updateShowSoftwareKeyboard($event.checked)">
        {{'propertiesPanel.showSoftwareKeyboard' | translate }}
      </mat-checkbox>
      <mat-checkbox [disabled]="!combinedProperties.inputAssistancePreset ||
                      (!!combinedProperties.inputAssistancePreset && !!combinedProperties.showSoftwareKeyboard)"
                    [checked]="$any(combinedProperties.hideNativeKeyboard)"
                    (change)="updateModel.emit({ property: 'hideNativeKeyboard', value: $event.checked })">
        {{'propertiesPanel.hideNativeKeyboard' | translate }}
      </mat-checkbox>
      <mat-checkbox [disabled]="!combinedProperties.showSoftwareKeyboard"
                    [checked]="$any(combinedProperties.addInputAssistanceToKeyboard)"
                    (change)="updateModel.emit({ property: 'addInputAssistanceToKeyboard', value: $event.checked })">
        {{'propertiesPanel.addInputAssistanceToKeyboard' | translate }}
      </mat-checkbox>

      <mat-form-field appearance="fill"
                      class="wide-form-field">
        <mat-label>{{'propertiesPanel.inputAssistance' | translate }}</mat-label>
        <mat-select [value]="combinedProperties.inputAssistancePreset"
                    (selectionChange)="updateInputAssistancePreset($event.value)">
          <ng-container *ngIf="combinedProperties.type !== 'math-table'">
            <mat-option *ngFor="let option of [null, 'french', 'numbers', 'numbersAndOperators',
                                              'numbersAndBasicOperators', 'comparisonOperators', 'chemicalEquation',
                                              'squareDashDot', 'placeValue', 'space', 'comma', 'custom']"
                        [value]="option">
              {{ option === null ? ('propertiesPanel.none' | translate) : ('propertiesPanel.' + option | translate) }}
            </mat-option>
          </ng-container>
          <ng-container *ngIf="combinedProperties.type === 'math-table' &&
                               ['addition', 'subtraction'].includes($any(combinedProperties.operation))">
            <mat-option *ngFor="let option of [null, 'numbers']"
                        [value]="option">
              {{ option === null ? ('propertiesPanel.none' | translate) : ('propertiesPanel.' + option | translate) }}
            </mat-option>
          </ng-container>
          <ng-container *ngIf="combinedProperties.type === 'math-table' &&
                               combinedProperties.operation === 'multiplication'">
            <mat-option *ngFor="let option of [null, 'numbers', 'numbersAndBasicOperators']"
                        [value]="option">
              {{ option === null ? ('propertiesPanel.none' | translate) : ('propertiesPanel.' + option | translate) }}
            </mat-option>
          </ng-container>
          <ng-container *ngIf="combinedProperties.type === 'math-table' &&
                               combinedProperties.operation === 'variable'">
            <mat-option *ngFor="let option of [null, 'numbers', 'numbersAndBasicOperators', 'numbersAndOperators']"
                        [value]="option">
              {{ option === null ? ('propertiesPanel.none' | translate) : ('propertiesPanel.' + option | translate) }}
            </mat-option>
          </ng-container>
        </mat-select>
      </mat-form-field>

      <mat-form-field *ngIf="combinedProperties.inputAssistancePreset === 'custom'"
                      class="wide-form-field" appearance="fill">
        <mat-label>{{'propertiesPanel.inputAssistanceCustomKeys' | translate }}</mat-label>
        <input matInput type="text"
               [value]="$any(combinedProperties.inputAssistanceCustomKeys)"
               (input)="updateModel.emit({ property: 'inputAssistanceCustomKeys', value: $any($event.target).value })">
      </mat-form-field>

      <mat-form-field *ngIf="combinedProperties.inputAssistancePreset !== null &&
                             combinedProperties.inputAssistancePosition !== undefined"
                      appearance="fill">
        <mat-label>{{'propertiesPanel.inputAssistancePosition' | translate }}</mat-label>
        <mat-select [value]="combinedProperties.inputAssistancePosition"
                    (selectionChange)="updateModel.emit({ property: 'inputAssistancePosition', value: $event.value })">
          <mat-option *ngFor="let option of ['floating', 'right']"
                      [value]="option">
            {{ 'propertiesPanel.' + option | translate }}
          </mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field *ngIf="combinedProperties.inputAssistancePreset !== null &&
                             combinedProperties.inputAssistancePosition === 'floating'"
                      appearance="fill">
        <mat-label>{{'propertiesPanel.inputAssistanceFloatingStartPosition' | translate }}</mat-label>
        <mat-select [value]="combinedProperties.inputAssistanceFloatingStartPosition"
                    (selectionChange)="updateModel.emit({
                      property: 'inputAssistanceFloatingStartPosition',
                      value: $event.value
                    })">
          <mat-option *ngFor="let option of ['startBottom', 'endCenter']"
                      [value]="option">
            {{ 'propertiesPanel.' + option | translate }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <mat-checkbox *ngIf="combinedProperties.inputAssistancePreset !== null &&
                         combinedProperties.restrictedToInputAssistanceChars !== undefined"
                    [checked]="$any(combinedProperties.restrictedToInputAssistanceChars)"
                    (change)="updateModel.emit({ property: 'restrictedToInputAssistanceChars', value: $event.checked })">
        {{'propertiesPanel.restrictedToInputAssistanceChars' | translate }}
      </mat-checkbox>

      <mat-checkbox *ngIf="combinedProperties.inputAssistancePreset !== null &&
                         combinedProperties.hasArrowKeys !== undefined"
                    [checked]="$any(combinedProperties.hasArrowKeys)"
                    (change)="updateModel.emit({ property: 'hasArrowKeys', value: $event.checked })">
        {{'propertiesPanel.hasArrowKeys' | translate }}
      </mat-checkbox>

      <mat-checkbox *ngIf="combinedProperties.inputAssistancePreset !== null &&
                         combinedProperties.hasBackspaceKey !== undefined"
                    [disabled]="combinedProperties.inputAssistancePreset !== 'custom'"
                    [checked]="combinedProperties.inputAssistancePreset === 'custom' ?
                                $any(combinedProperties.hasBackspaceKey) :
                                combinedProperties.inputAssistancePreset !== 'french'"
                    (change)="updateModel.emit({ property: 'hasBackspaceKey', value: $event.checked })">
        {{'propertiesPanel.hasBackspaceKey' | translate }}
      </mat-checkbox>

      <mat-checkbox *ngIf="combinedProperties.type === 'text-area' && combinedProperties.inputAssistancePreset !== null &&
                         combinedProperties.hasReturnKey !== undefined"
                    [checked]="$any(combinedProperties.hasReturnKey)"
                    (change)="updateModel.emit({ property: 'hasReturnKey', value: $event.checked })">
        {{'propertiesPanel.hasReturnKey' | translate }}
      </mat-checkbox>
    </fieldset>
  `
})

export class InputAssistancePropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel = new EventEmitter<{
    property: string;
    value: string | number | boolean | string[] | null;
    isInputValid?: boolean | null;
  }>();

  updateInputAssistancePreset(inputAssistancePreset: string | null): void {
    this.updateModel.emit({ property: 'inputAssistancePreset', value: inputAssistancePreset });
    if (!inputAssistancePreset && !this.combinedProperties.showSoftwareKeyboard) {
      this.updateModel.emit({ property: 'hideNativeKeyboard', value: false });
    }
  }

  updateShowSoftwareKeyboard(showSoftwareKeyboard: boolean): void {
    this.updateModel.emit({ property: 'showSoftwareKeyboard', value: showSoftwareKeyboard });
    if (showSoftwareKeyboard) {
      this.updateModel.emit({ property: 'hideNativeKeyboard', value: true });
    } else if (!this.combinedProperties.inputAssistancePreset) {
      this.updateModel.emit({ property: 'hideNativeKeyboard', value: false });
    }
  }
}
