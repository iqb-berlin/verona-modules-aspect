import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CombinedProperties } from 'editor/src/app/components/properties-panel/element-properties-panel.component';

@Component({
  selector: 'aspect-preset-value-properties',
  template: `
    <mat-form-field *ngIf="combinedProperties.type === 'text-area'"
                    class="wide-form-field" appearance="fill">
      <mat-label>{{'preset' | translate }}</mat-label>
      <textarea matInput type="text"
                [value]="$any(combinedProperties.value)"
                (input)="updateModel.emit({ property: 'value', value: $any($event.target).value })">
            </textarea>
    </mat-form-field>

    <mat-form-field *ngIf="combinedProperties.type === 'text-field' || combinedProperties.type === 'text-field-simple'"
                    class="wide-form-field" appearance="fill">
      <mat-label>{{'preset' | translate }}</mat-label>
      <input matInput type="text" [value]="$any(combinedProperties).value"
             (input)="updateModel.emit({property: 'value', value: $any($event.target).value })">
    </mat-form-field>

    <mat-form-field *ngIf="combinedProperties.options !== undefined && combinedProperties.rows === undefined"
                    appearance="fill" class="wide-form-field">
      <mat-label>{{'preset' | translate }}</mat-label>
      <mat-select [value]="combinedProperties.value"
                  (selectionChange)="updateModel.emit({ property: 'value', value: $event.value })">
        <mat-select-trigger [innerHTML]="combinedProperties.value !== undefined && combinedProperties.value !== null ?
                                         $any(combinedProperties.options)[$any(combinedProperties.value)].text :
                                         ''">
        </mat-select-trigger>
        <mat-option [value]="null">{{'propertiesPanel.undefined' | translate }}</mat-option>
        <mat-option *ngFor="let option of $any(combinedProperties.options); let i = index" [value]="i">
          <div [innerHTML]="option.text + ' (Index: ' + i + ')' | safeResourceHTML"></div>
        </mat-option>
      </mat-select>
    </mat-form-field>

    <ng-container *ngIf="combinedProperties.type === 'math-field'">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <mat-label>{{'preset' | translate }}</mat-label>
        <button mat-icon-button (click)="showLatexEditor = !showLatexEditor"
                [matTooltip]="(showLatexEditor ? 'propertiesPanel.showFormula' : 'propertiesPanel.showLatex') | translate">
          <mat-icon>{{ showLatexEditor ? 'functions' : 'code' }}</mat-icon>
        </button>
      </div>

      <aspect-math-input *ngIf="!showLatexEditor"
                         [value]="$any(combinedProperties).value"
                         [enableModeSwitch]="$any(combinedProperties).enableModeSwitch"
                         [mathKeyboardPresets]="$any(combinedProperties).mathKeyboardPresets"
                         [placeholder]="'propertiesPanel.formulaPlaceholder' | translate"
                         (valueChange)="updateModel.emit({property: 'value', value: $event })">
      </aspect-math-input>

      <mat-form-field *ngIf="showLatexEditor" class="wide-form-field" appearance="fill">
        <input matInput [value]="$any(combinedProperties).value"
               [placeholder]="'propertiesPanel.latexPlaceholder' | translate"
               (input)="updateModel.emit({property: 'value', value: $any($event.target).value })">
      </mat-form-field>
    </ng-container>
  `,
  standalone: false
})
export class PresetValuePropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel =
    new EventEmitter<{ property: string; value: string | number | boolean | string[], isInputValid?: boolean | null }>();

  showLatexEditor = false;
}
