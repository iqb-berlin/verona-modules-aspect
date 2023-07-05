import { Component, Input } from '@angular/core';
import { UnitService } from 'editor/src/app/services/unit.service';
import { Stylings } from 'common/models/elements/property-group-interfaces';

@Component({
  selector: 'aspect-element-style-properties',
  template: `
    <div class="fx-column-start-stretch" *ngIf="styles">
      <mat-checkbox *ngIf="styles.lineColoring !== undefined"
                    [checked]="$any(styles.lineColoring)"
                    (change)="unitService.updateSelectedElementsStyleProperty('lineColoring', $event.checked)">
        {{'propertiesPanel.lineColoring' | translate }}
      </mat-checkbox>

      <mat-form-field *ngIf="styles.lineColoring && styles.lineColoringColor !== undefined"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.lineColoringColor' | translate }}</mat-label>
        <input matInput type="text" [value]="styles.lineColoringColor"
               (input)="unitService.updateSelectedElementsStyleProperty('lineColoringColor', $any($event.target).value)">
        <button mat-icon-button matSuffix (click)="lineColorInput.click()">
          <mat-icon>edit</mat-icon>
        </button>
      </mat-form-field>
      <input matInput type="color" hidden #lineColorInput
             [value]="styles.lineColoringColor"
             (input)="unitService.updateSelectedElementsStyleProperty('lineColoringColor', $any($event.target).value)">

      <mat-form-field *ngIf="styles.selectionColor !== undefined" appearance="fill">
        <mat-label>{{'propertiesPanel.selectionColor' | translate }}</mat-label>
        <input matInput type="text" [value]="styles.selectionColor"
               (input)="unitService.updateSelectedElementsStyleProperty('selectionColor', $any($event.target).value)">
        <button mat-icon-button matSuffix (click)="selectionColorInput.click()">
          <mat-icon>edit</mat-icon>
        </button>
      </mat-form-field>
      <input matInput type="color" hidden #selectionColorInput
             [value]="styles.selectionColor"
             (input)="unitService.updateSelectedElementsStyleProperty('selectionColor', $any($event.target).value)">

      <mat-form-field *ngIf="styles.itemBackgroundColor !== undefined"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.itemBackgroundColor' | translate }}</mat-label>
        <input matInput type="text" [value]="styles.itemBackgroundColor"
               (input)="unitService.updateSelectedElementsStyleProperty('itemBackgroundColor', $any($event.target).value)">
        <button mat-icon-button matSuffix (click)="itembackgroundColorInput.click()">
          <mat-icon>edit</mat-icon>
        </button>
      </mat-form-field>
      <input matInput type="color" hidden #itembackgroundColorInput
             [value]="styles.itemBackgroundColor"
             (input)="unitService.updateSelectedElementsStyleProperty('itemBackgroundColor', $any($event.target).value)">

      <mat-form-field *ngIf="styles.backgroundColor !== undefined"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.backgroundColor' | translate }}</mat-label>
        <input matInput type="text" [value]="styles.backgroundColor"
               (input)="unitService.updateSelectedElementsStyleProperty('backgroundColor', $any($event.target).value)">
        <button mat-icon-button matSuffix (click)="backgroundColorInput.click()">
          <mat-icon>edit</mat-icon>
        </button>
      </mat-form-field>
      <input matInput type="color" hidden #backgroundColorInput
             [value]="styles.backgroundColor"
             (input)="unitService.updateSelectedElementsStyleProperty('backgroundColor', $any($event.target).value)">

      <mat-form-field *ngIf="styles.fontColor !== undefined"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.fontColor' | translate }}</mat-label>
        <input matInput type="text" [value]="styles.fontColor"
               (input)="unitService.updateSelectedElementsStyleProperty('fontColor', $any($event.target).value)">
        <button mat-icon-button matSuffix (click)="fontColorInput.click()">
          <mat-icon>edit</mat-icon>
        </button>
      </mat-form-field>
      <input matInput type="color" hidden #fontColorInput
             [value]="styles.fontColor"
             (input)="unitService.updateSelectedElementsStyleProperty('fontColor', $any($event.target).value)">

      <mat-form-field *ngIf="styles.font !== undefined"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.font' | translate }}</mat-label>
        <input matInput type="text" [value]="styles.font" disabled
               (input)="unitService.updateSelectedElementsStyleProperty('font', $any($event.target).value)">
      </mat-form-field>
      <mat-form-field *ngIf="styles.fontSize !== undefined"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.fontSize' | translate }}</mat-label>
        <input matInput type="number" #fontSize="ngModel" min="0"
               [ngModel]="styles.fontSize"
               (ngModelChange)="unitService.updateSelectedElementsStyleProperty('fontSize', $event)">
      </mat-form-field>
      <mat-form-field *ngIf="styles.lineHeight !== undefined"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.lineHeight' | translate }}</mat-label>
        <input matInput type="number" #lineHeight="ngModel" min="0"
               [ngModel]="styles.lineHeight"
               (ngModelChange)="unitService.updateSelectedElementsStyleProperty('lineHeight', $event)">
      </mat-form-field>

      <mat-checkbox *ngIf="styles.bold !== undefined"
                    [checked]="$any(styles.bold)"
                    (change)="unitService.updateSelectedElementsStyleProperty('bold', $event.checked)">
        {{'propertiesPanel.bold' | translate }}
      </mat-checkbox>
      <mat-checkbox *ngIf="styles.italic !== undefined"
                    [checked]="$any(styles.italic)"
                    (change)="unitService.updateSelectedElementsStyleProperty('italic', $event.checked)">
        {{'propertiesPanel.italic' | translate }}
      </mat-checkbox>
      <mat-checkbox *ngIf="styles.underline !== undefined"
                    [checked]="$any(styles.underline)"
                    (change)="unitService.updateSelectedElementsStyleProperty('underline', $event.checked)">
        {{'propertiesPanel.underline' | translate }}
      </mat-checkbox>

    </div>

    <fieldset *ngIf="styles && styles.borderRadius !== undefined">
      <legend>Rahmen</legend>

      <mat-form-field *ngIf="styles.borderRadius !== undefined" appearance="fill">
        <mat-label>{{'propertiesPanel.borderRadius' | translate }}</mat-label>
        <input matInput type="number" [ngModel]="styles.borderRadius"
               (input)="unitService.updateSelectedElementsStyleProperty('borderRadius', $any($event.target).value)">
      </mat-form-field>

      <mat-form-field *ngIf="styles.borderColor !== undefined"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.borderColor' | translate }}</mat-label>
        <input matInput type="text" [value]="styles.borderColor"
               (input)="unitService.updateSelectedElementsStyleProperty('borderColor', $any($event.target).value)">
        <button mat-icon-button matSuffix (click)="borderColorInput.click()">
          <mat-icon>edit</mat-icon>
        </button>
      </mat-form-field>
      <input matInput type="color" hidden #borderColorInput
             [value]="styles.borderColor"
             (input)="unitService.updateSelectedElementsStyleProperty('borderColor', $any($event.target).value)">

      <mat-form-field *ngIf="styles.borderStyle !== undefined"
                      appearance="fill">
        <mat-label>{{'propertiesPanel.borderStyle' | translate }}</mat-label>
        <mat-select [value]="styles.borderStyle"
                    (selectionChange)="unitService.updateSelectedElementsStyleProperty('borderStyle', $event.value)">
          <mat-option *ngFor="let option of ['solid', 'dotted', 'dashed',
                                         'double', 'groove', 'ridge', 'inset', 'outset']"
                      [value]="option">
            {{option}}
          </mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field *ngIf="styles.borderWidth !== undefined"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.borderWidth' | translate }}</mat-label>
        <input matInput type="number" #borderWidth="ngModel"
               [ngModel]="styles.borderWidth"
               (ngModelChange)="unitService.updateSelectedElementsStyleProperty('borderWidth', $event)">
      </mat-form-field>
    </fieldset>
  `,
  styles: [`
    .fx-column-start-stretch {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: stretch;
    }
  `]
})
export class ElementStylePropertiesComponent {
  @Input() styles!: Stylings | undefined;

  constructor(public unitService: UnitService) { }
}
