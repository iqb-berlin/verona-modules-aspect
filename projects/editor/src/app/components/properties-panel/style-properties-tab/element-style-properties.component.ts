import { Component, Input } from '@angular/core';
import { UnitService } from 'editor/src/app/services/unit-services/unit.service';
import { Stylings } from 'common/models/elements/property-group-interfaces';
import { ElementService } from 'editor/src/app/services/unit-services/element.service';

@Component({
  selector: 'aspect-element-style-properties',
  template: `
    <div class="fx-column-start-stretch" *ngIf="styles">
      <mat-form-field *ngIf="styles.helperRowColor !== undefined"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.helperRowColor' | translate }}</mat-label>
        <input matInput type="text" [value]="styles.helperRowColor"
               (input)="elementService.updateSelectedElementsStyleProperty(
                          'helperRowColor', $any($event.target).value)">
        <button mat-icon-button matSuffix (click)="helperRowColorInput.click()">
          <mat-icon>edit</mat-icon>
        </button>
      </mat-form-field>
      <input matInput type="color" hidden #helperRowColorInput
             [value]="styles.helperRowColor"
             (input)="elementService.updateSelectedElementsStyleProperty('helperRowColor', $any($event.target).value)">

      <mat-checkbox *ngIf="styles.lineColoring !== undefined"
                    [checked]="$any(styles.lineColoring)"
                    (change)="elementService.updateSelectedElementsStyleProperty('lineColoring', $event.checked)">
        {{'propertiesPanel.lineColoring' | translate }}
      </mat-checkbox>

      <mat-form-field *ngIf="styles.lineColoringColor !== undefined"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.lineColoringColor' | translate }}</mat-label>
        <input matInput type="text" [value]="styles.lineColoringColor"
               [disabled]="!styles.lineColoring || styles.lineColoringColor === undefined"
               (input)="elementService.updateSelectedElementsStyleProperty(
                          'lineColoringColor', $any($event.target).value)">
        <button mat-icon-button matSuffix (click)="lineColorInput.click()">
          <mat-icon>edit</mat-icon>
        </button>
      </mat-form-field>
      <input matInput type="color" hidden #lineColorInput
             [value]="styles.lineColoringColor"
             (input)="elementService.updateSelectedElementsStyleProperty('lineColoringColor', $any($event.target).value)">

      <mat-checkbox *ngIf="styles.firstLineColoring !== undefined"
                    [checked]="$any(styles.firstLineColoring)"
                    (change)="elementService.updateSelectedElementsStyleProperty('firstLineColoring', $event.checked)">
        {{'propertiesPanel.firstLineColoring' | translate }}
      </mat-checkbox>

      <mat-form-field *ngIf="styles.firstLineColoringColor !== undefined"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.firstLineColoringColor' | translate }}</mat-label>
        <input matInput type="text" [value]="styles.firstLineColoringColor"
               [disabled]="!styles.firstLineColoring || styles.firstLineColoringColor === undefined"
               (input)="elementService.updateSelectedElementsStyleProperty(
                          'firstLineColoringColor', $any($event.target).value)">
        <button mat-icon-button matSuffix (click)="firstLineColorInput.click()">
          <mat-icon>edit</mat-icon>
        </button>
      </mat-form-field>
      <input matInput type="color" hidden #firstLineColorInput
             [value]="styles.firstLineColoringColor"
             (input)="elementService.updateSelectedElementsStyleProperty(
                'firstLineColoringColor', $any($event.target).value)">

      <mat-form-field *ngIf="styles.selectionColor !== undefined" appearance="fill">
        <mat-label>{{'propertiesPanel.selectionColor' | translate }}</mat-label>
        <input matInput type="text" [value]="styles.selectionColor"
               (input)="elementService.updateSelectedElementsStyleProperty('selectionColor', $any($event.target).value)">
        <button mat-icon-button matSuffix (click)="selectionColorInput.click()">
          <mat-icon>edit</mat-icon>
        </button>
      </mat-form-field>
      <input matInput type="color" hidden #selectionColorInput
             [value]="styles.selectionColor"
             (input)="elementService.updateSelectedElementsStyleProperty('selectionColor', $any($event.target).value)">

      <mat-form-field *ngIf="styles.itemBackgroundColor !== undefined"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.itemBackgroundColor' | translate }}</mat-label>
        <input matInput type="text" [value]="styles.itemBackgroundColor"
               (input)="elementService.updateSelectedElementsStyleProperty('itemBackgroundColor', $any($event.target).value)">
        <button mat-icon-button matSuffix (click)="itembackgroundColorInput.click()">
          <mat-icon>edit</mat-icon>
        </button>
      </mat-form-field>
      <input matInput type="color" hidden #itembackgroundColorInput
             [value]="styles.itemBackgroundColor"
             (input)="elementService.updateSelectedElementsStyleProperty('itemBackgroundColor', $any($event.target).value)">

      <mat-form-field *ngIf="styles.backgroundColor !== undefined"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.backgroundColor' | translate }}</mat-label>
        <input matInput type="text" [value]="styles.backgroundColor"
               (input)="elementService.updateSelectedElementsStyleProperty('backgroundColor', $any($event.target).value)">
        <button mat-icon-button matSuffix (click)="backgroundColorInput.click()">
          <mat-icon>edit</mat-icon>
        </button>
      </mat-form-field>
      <input matInput type="color" hidden #backgroundColorInput
             [value]="styles.backgroundColor"
             (input)="elementService.updateSelectedElementsStyleProperty('backgroundColor', $any($event.target).value)">

      <mat-form-field *ngIf="styles.fontColor !== undefined"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.fontColor' | translate }}</mat-label>
        <input matInput type="text" [value]="styles.fontColor"
               (input)="elementService.updateSelectedElementsStyleProperty('fontColor', $any($event.target).value)">
        <button mat-icon-button matSuffix (click)="fontColorInput.click()">
          <mat-icon>edit</mat-icon>
        </button>
      </mat-form-field>
      <input matInput type="color" hidden #fontColorInput
             [value]="styles.fontColor"
             (input)="elementService.updateSelectedElementsStyleProperty('fontColor', $any($event.target).value)">

<!--      <mat-form-field *ngIf="styles.font !== undefined"-->
<!--                      appearance="fill" class="mdInput textsingleline">-->
<!--        <mat-label>{{'propertiesPanel.font' | translate }}</mat-label>-->
<!--        <input matInput type="text" [value]="styles.font" disabled-->
<!--               (input)="elementService.updateSelectedElementsStyleProperty('font', $any($event.target).value)">-->
<!--      </mat-form-field>-->
      <mat-form-field *ngIf="styles.fontSize !== undefined"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.fontSize' | translate }}</mat-label>
        <input matInput type="number" #fontSize="ngModel" min="0"
               [ngModel]="styles.fontSize"
               (ngModelChange)="elementService.updateSelectedElementsStyleProperty('fontSize', $event)"
               (change)="styles.fontSize = styles.fontSize ? styles.fontSize : 0">
      </mat-form-field>
      <mat-form-field *ngIf="styles.lineHeight !== undefined"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.lineHeight' | translate }}</mat-label>
        <input matInput type="number" #lineHeight="ngModel" min="0"
               [ngModel]="styles.lineHeight"
               (ngModelChange)="elementService.updateSelectedElementsStyleProperty('lineHeight', $event)"
               (change)="styles.lineHeight = styles.lineHeight ? styles.lineHeight : 0">
      </mat-form-field>

      <mat-checkbox *ngIf="styles.bold !== undefined"
                    [checked]="$any(styles.bold)"
                    (change)="elementService.updateSelectedElementsStyleProperty('bold', $event.checked)">
        {{'propertiesPanel.bold' | translate }}
      </mat-checkbox>
      <mat-checkbox *ngIf="styles.italic !== undefined"
                    [checked]="$any(styles.italic)"
                    (change)="elementService.updateSelectedElementsStyleProperty('italic', $event.checked)">
        {{'propertiesPanel.italic' | translate }}
      </mat-checkbox>
      <mat-checkbox *ngIf="styles.underline !== undefined"
                    [checked]="$any(styles.underline)"
                    (change)="elementService.updateSelectedElementsStyleProperty('underline', $event.checked)">
        {{'propertiesPanel.underline' | translate }}
      </mat-checkbox>

    </div>

    <fieldset *ngIf="styles && styles.borderRadius !== undefined">
      <legend>Rahmen</legend>

      <mat-form-field *ngIf="styles.borderRadius !== undefined" appearance="fill">
        <mat-label>{{'propertiesPanel.borderRadius' | translate }}</mat-label>
        <input matInput type="number" [ngModel]="styles.borderRadius"
               (ngModelChange)="elementService.updateSelectedElementsStyleProperty('borderRadius', $event)"
               (change)="styles.borderRadius = styles.borderRadius ? styles.borderRadius : 0">
      </mat-form-field>

      <mat-form-field *ngIf="styles.borderColor !== undefined"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.borderColor' | translate }}</mat-label>
        <input matInput type="text" [value]="styles.borderColor"
               (input)="elementService.updateSelectedElementsStyleProperty('borderColor', $any($event.target).value)">
        <button mat-icon-button matSuffix (click)="borderColorInput.click()">
          <mat-icon>edit</mat-icon>
        </button>
      </mat-form-field>
      <input matInput type="color" hidden #borderColorInput
             [value]="styles.borderColor"
             (input)="elementService.updateSelectedElementsStyleProperty('borderColor', $any($event.target).value)">

      <mat-form-field *ngIf="styles.borderStyle !== undefined"
                      appearance="fill">
        <mat-label>{{'propertiesPanel.borderStyle' | translate }}</mat-label>
        <mat-select [value]="styles.borderStyle"
                    (selectionChange)="elementService.updateSelectedElementsStyleProperty('borderStyle', $event.value)">
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
               (ngModelChange)="elementService.updateSelectedElementsStyleProperty('borderWidth', $event)"
               (change)="styles.borderRadius = styles.borderRadius ? styles.borderRadius : 0">
      </mat-form-field>
    </fieldset>
  `
})
export class ElementStylePropertiesComponent {
  @Input() styles!: Stylings | undefined;

  constructor(public elementService: ElementService) { }
}
