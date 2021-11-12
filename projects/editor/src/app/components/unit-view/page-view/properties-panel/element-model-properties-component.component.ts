import {
  Component, EventEmitter,
  Input, Output
} from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop/drag-events';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { InputElementValue, UIElement } from '../../../../../../../common/models/uI-element';
import { LikertElement } from '../../../../../../../common/models/compound-elements/likert-element';
import { LikertElementRow } from '../../../../../../../common/models/compound-elements/likert-element-row';
import { LikertColumn, LikertRow } from '../../../../../../../common/interfaces/UIElementInterfaces';
import { UnitService } from '../../../../services/unit.service';
import { FileService } from '../../../../../../../common/file.service';

@Component({
  selector: 'app-element-model-properties-component',
  template: `
    <div fxLayout="column">
      <mat-form-field appearance="fill">
        <mat-label>{{'propertiesPanel.id' | translate }}</mat-label>
        <input matInput type="text" *ngIf="selectedElements.length === 1" [value]="combinedProperties.id"
               (input)="updateModel.emit({property: 'id', value: $any($event.target).value })">
        <input matInput type="text" disabled *ngIf="selectedElements.length > 1" [value]="'Muss eindeutig sein'">
      </mat-form-field>

      <mat-form-field *ngIf="combinedProperties.label !== undefined" appearance="fill">
        <mat-label>{{'propertiesPanel.label' | translate }}</mat-label>
        <input matInput type="text" [value]="combinedProperties.label"
               (input)="updateModel.emit({property: 'label', value: $any($event.target).value })">
      </mat-form-field>

      <ng-container *ngIf="combinedProperties.text">
        {{'propertiesPanel.text' | translate }}
        <div class="text-text" [innerHTML]="$any(combinedProperties.text) | safeResourceHTML"
             (click)="unitService.showDefaultEditDialog(selectedElements[0])">
        </div>
      </ng-container>

      <!-- Autostart for detecting a player-element -->
      <ng-container *ngIf="combinedProperties.autostart !== undefined">
        <button (click)="unitService.showDefaultEditDialog(selectedElements[0])">
          <mat-icon>build_circle</mat-icon>
        </button>
      </ng-container>

      <mat-form-field *ngIf="combinedProperties.interaction !== undefined" appearance="fill">
        <mat-label>{{'propertiesPanel.interaction' | translate }}</mat-label>
        <mat-select [value]="combinedProperties.interaction"
                    (selectionChange)="updateModel.emit({ property: 'interaction', value: $event.value })">
          <mat-option *ngFor="let interaction of ['none', 'highlightable', 'underlinable', 'strikable']"
                      [value]="interaction">
            {{'propertiesPanel.' + interaction | translate }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <mat-checkbox *ngIf="combinedProperties.strikeOtherOptions !== undefined"
                    [checked]="$any(combinedProperties.strikeOtherOptions)"
                    (change)="updateModel.emit({ property: 'strikeOtherOptions', value: $event.checked })">
        {{'propertiesPanel.strikeOtherOptions' | translate }}
      </mat-checkbox>

      <mat-checkbox *ngIf="combinedProperties.allowUnset !== undefined"
                    [checked]="$any(combinedProperties.allowUnset)"
                    (change)="updateModel.emit({ property: 'allowUnset', value: $event.checked })">
        {{'propertiesPanel.allowUnset' | translate }}
      </mat-checkbox>

      <mat-checkbox *ngIf="combinedProperties.readOnly !== undefined"
                    [checked]="$any(combinedProperties.readOnly)"
                    (change)="updateModel.emit({ property: 'readOnly', value: $event.checked })">
        {{'propertiesPanel.readOnly' | translate }}
      </mat-checkbox>
      <mat-checkbox *ngIf="combinedProperties.required !== undefined"
                    [checked]="$any(combinedProperties.required)"
                    (change)="updateModel.emit({ property: 'required', value: $event.checked })">
        {{'propertiesPanel.requiredField' | translate }}
      </mat-checkbox>
      <mat-form-field *ngIf="combinedProperties.required"
                      appearance="fill">
        <mat-label>{{'propertiesPanel.requiredWarnMessage' | translate }}</mat-label>
        <input matInput type="text" [value]="combinedProperties.requiredWarnMessage"
               (input)="updateModel.emit({ property: 'requiredWarnMessage', value: $any($event.target).value })">
      </mat-form-field>

      <mat-form-field disabled="true" *ngIf="combinedProperties.options !== undefined">
        <ng-container>
          <mat-label>{{'propertiesPanel.options' | translate }}</mat-label>
          <div class="drop-list" cdkDropList [cdkDropListData]="combinedProperties.options"
               (cdkDropListDropped)="reorderOptions('options', $any($event))">
            <div *ngFor="let option of $any(combinedProperties.options); let i = index" cdkDrag
                 class="list-items" fxLayout="row" fxLayoutAlign="end center">
              <div fxFlex="70">
                {{option}}
              </div>
              <button mat-icon-button color="primary"
                      (click)="editTextOption('options', i)">
                <mat-icon>build</mat-icon>
              </button>
              <button mat-icon-button color="primary"
                      (click)="removeOption('options', option)">
                <mat-icon>clear</mat-icon>
              </button>
            </div>
          </div>
        </ng-container>
        <div fxLayout="row" fxLayoutAlign="center center">
          <button mat-icon-button matPrefix
                  (click)="addOption('options', newOption.value); newOption.select()">
            <mat-icon>add</mat-icon>
          </button>
          <input #newOption matInput type="text" placeholder="Optionstext"
                 (keyup.enter)="addOption('options', newOption.value); newOption.select()">
        </div>
      </mat-form-field>

      <mat-form-field disabled="true" *ngIf="combinedProperties.connectedTo !== undefined">
        <ng-container>
          <mat-label>{{'preset' | translate }}</mat-label>
          <div class="drop-list" cdkDropList [cdkDropListData]="combinedProperties.value"
               (cdkDropListDropped)="reorderOptions('value', $any($event))">
            <div *ngFor="let value of $any(combinedProperties.value); let i = index" cdkDrag
                 class="list-items" fxLayout="row" fxLayoutAlign="end center">
              <div fxFlex="70">
                {{value}}
              </div>
              <button mat-icon-button color="primary"
                      (click)="editTextOption('value', i)">
                <mat-icon>build</mat-icon>
              </button>
              <button mat-icon-button color="primary"
                      (click)="removeOption('value', value)">
                <mat-icon>clear</mat-icon>
              </button>
            </div>
          </div>
        </ng-container>
        <div fxLayout="row" fxLayoutAlign="center center">
          <button mat-icon-button matPrefix
                  (click)="addOption('value', newValue.value); newValue.select()">
            <mat-icon>add</mat-icon>
          </button>
          <input #newValue matInput type="text"
                 (keyup.enter)="addOption('value', newValue.value); newValue.select()">
        </div>
      </mat-form-field>

      <mat-form-field *ngIf="combinedProperties.alignment" appearance="fill">
        <mat-label>{{'propertiesPanel.alignment' | translate }}</mat-label>
        <mat-select [value]="combinedProperties.alignment"
                    (selectionChange)="updateModel.emit({ property: 'alignment', value: $event.value })">
          <mat-option *ngFor="let option of ['column', 'row']"
                      [value]="option">
            {{ 'propertiesPanel.' + option | translate }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <mat-checkbox *ngIf="combinedProperties.resizeEnabled !== undefined"
                    [checked]="$any(combinedProperties.resizeEnabled)"
                    (change)="updateModel.emit({ property: 'resizeEnabled', value: $event.checked })">
        {{'propertiesPanel.resizeEnabled' | translate }}
      </mat-checkbox>

      <mat-form-field *ngIf="combinedProperties.rowCount != null"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'rows' | translate }}</mat-label>
        <input matInput type="number" [value]="combinedProperties.rowCount"
               (input)="updateModel.emit({ property: 'rowCount', value: $any($event.target).value })">
      </mat-form-field>

      <mat-form-field *ngIf="combinedProperties.action !== undefined" appearance="fill">
        <mat-label>{{'propertiesPanel.action' | translate }}</mat-label>
        <mat-select [value]="combinedProperties.action"
                    (selectionChange)="updateModel.emit({ property: 'action', value: $event.value })">
          <mat-option *ngFor="let option of [undefined, 'previous', 'next', 'first', 'last', 'end']"
                      [value]="option">
            {{ 'propertiesPanel.' + option | translate }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <ng-container *ngIf="combinedProperties.imageSrc !== undefined">
        <input #imageUpload type="file" hidden (click)="loadImage()">
        <button mat-raised-button (click)="imageUpload.click()">{{'loadImage' | translate }}</button>
        <button mat-raised-button (click)="removeImage()">{{'removeImage' | translate }}</button>
        <img [src]="combinedProperties.imageSrc"
             [style.object-fit]="'scale-down'"
             [width]="200">
      </ng-container>

      <mat-form-field *ngIf="combinedProperties.options !== undefined && !combinedProperties.connectedTo"
                      appearance="fill">
        <mat-label>{{'preset' | translate }}</mat-label>
        <mat-select [value]="combinedProperties.value"
                    (selectionChange)="updateModel.emit({ property: 'value', value: $event.value })">
          <mat-option [value]="null">{{'propertiesPanel.undefined' | translate }}</mat-option>
          <mat-option *ngFor="let option of $any(combinedProperties.options); let i = index" [value]="i">
            {{option}} (Index: {{i}})
          </mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field *ngIf="combinedProperties.columns !== undefined && combinedProperties.rows === undefined"
                      appearance="fill">
        <mat-label>{{'preset' | translate }}</mat-label>
        <mat-select [value]="combinedProperties.value"
                    (selectionChange)="updateModel.emit({ property: 'value', value: $event.value })">
          <mat-option [value]="null">{{'propertiesPanel.undefined' | translate }}</mat-option>
          <mat-option *ngFor="let column of $any(combinedProperties.columns); let i = index" [value]="i">
            {{column.name}} (Index: {{i}})
          </mat-option>
        </mat-select>
      </mat-form-field>

      <ng-container *ngIf="combinedProperties.value === true || combinedProperties.value === false">
        {{'preset' | translate }}
        <mat-button-toggle-group [value]="combinedProperties.value"
                                 (change)="updateModel.emit({ property: 'value', value: $event.value })">
          <mat-button-toggle [value]="true">{{'propertiesPanel.true' | translate }}</mat-button-toggle>
          <mat-button-toggle [value]="false">{{'propertiesPanel.false' | translate }}</mat-button-toggle>
        </mat-button-toggle-group>
      </ng-container>

      <!-- TODO wtf-->
      <mat-form-field *ngIf="combinedProperties.value !== undefined &&
                                 !combinedProperties.options && !combinedProperties.columns &&
                                 combinedProperties.connectedTo === undefined &&
                                 combinedProperties.value !== true && combinedProperties.value !== false"
                      appearance="fill">
        <mat-label>{{'preset' | translate }}</mat-label>
        <textarea matInput type="text"
                  [value]="combinedProperties.value"
                  (input)="updateModel.emit({ property: 'value', value: $any($event.target).value })">
            </textarea>
      </mat-form-field>

      <mat-form-field *ngIf="combinedProperties.appearance !== undefined" appearance="fill">
        <mat-label>{{'propertiesPanel.appearance' | translate }}</mat-label>
        <mat-select [value]="combinedProperties.appearance"
                    (selectionChange)="updateModel.emit({ property: 'appearance', value: $event.value })">
          <mat-option *ngFor="let option of [{displayValue: 'standard', value: 'standard'},
                                                 {displayValue: 'legacy', value: 'legacy'},
                                                 {displayValue: 'fill', value: 'fill'},
                                                 {displayValue: 'outline', value: 'outline'}]"
                      [value]="option.value">
            {{option.displayValue}}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field *ngIf="combinedProperties.minLength !== undefined" appearance="fill">
        <mat-label>{{'propertiesPanel.minLength' | translate }}</mat-label>
        <input matInput type="number" #minLength="ngModel" min="0"
               [ngModel]="combinedProperties.minLength"
               (ngModelChange)="updateModel.emit({
                  property: 'minLength',
                  value: $event,
                  isInputValid: minLength.valid })">
      </mat-form-field>
      <mat-form-field *ngIf="combinedProperties.minLength &&
                                     $any(combinedProperties.minLength) > 0"
                      appearance="fill">
        <mat-label>{{'propertiesPanel.minLengthWarnMessage' | translate }}</mat-label>
        <input matInput type="text" [value]="combinedProperties.minLengthWarnMessage"
               (input)="updateModel.emit({ property: 'minLengthWarnMessage', value: $any($event.target).value })">
      </mat-form-field>

      <mat-form-field *ngIf="combinedProperties.maxLength !== undefined" appearance="fill">
        <mat-label>{{'propertiesPanel.maxLength' | translate }}</mat-label>
        <input matInput type="number" #maxLength="ngModel" min="0"
               [ngModel]="combinedProperties.maxLength"
               (ngModelChange)="updateModel.emit({
                  property: 'maxLength',
                  value: $event,
                  isInputValid: maxLength.valid })">
      </mat-form-field>
      <mat-form-field *ngIf="combinedProperties.maxLength &&
                                     $any(combinedProperties.maxLength) > 0"
                      appearance="fill">
        <mat-label>{{'propertiesPanel.maxLengthWarnMessage' | translate }}</mat-label>
        <input matInput type="text" [value]="combinedProperties.maxLengthWarnMessage"
               (input)="updateModel.emit({ property: 'maxLengthWarnMessage', value: $any($event.target).value })">
      </mat-form-field>

      <mat-form-field *ngIf="combinedProperties.pattern !== undefined" appearance="fill">
        <mat-label>{{'propertiesPanel.pattern' | translate }}</mat-label>
        <input matInput [value]="combinedProperties.pattern"
               (input)="updateModel.emit({ property: 'pattern', value: $any($event.target).value })">
      </mat-form-field>
      <mat-form-field *ngIf="combinedProperties.pattern && $any(combinedProperties.pattern) !== ''"
                      appearance="fill"
                      matTooltip="Angabe als regulärer Ausdruck.">
        <mat-label>{{'propertiesPanel.patternWarnMessage' | translate }}</mat-label>
        <input matInput type="text" [value]="combinedProperties.patternWarnMessage"
               (input)="updateModel.emit({ property: 'patternWarnMessage', value: $any($event.target).value })">
      </mat-form-field>

      <mat-checkbox *ngIf="combinedProperties.clearable !== undefined"
                    [checked]="$any(combinedProperties.clearable)"
                    (change)="updateModel.emit({ property: 'clearable', value: $event.checked })">
        {{'propertiesPanel.clearable' | translate }}
      </mat-checkbox>

      <mat-form-field *ngIf="combinedProperties.inputAssistancePreset !== undefined" appearance="fill">
        <mat-label>{{'propertiesPanel.inputAssistance' | translate }}</mat-label>
        <mat-select [value]="combinedProperties.inputAssistancePreset"
                    (selectionChange)="updateModel.emit({ property: 'inputAssistancePreset', value: $event.value })">
          <mat-option *ngFor="let option of ['none', 'french', 'numbers', 'numbersAndOperators']"
                      [value]="option">
            {{ 'propertiesPanel.' + option | translate }}
          </mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field *ngIf="combinedProperties.inputAssistancePreset !== 'none' &&
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

      <mat-form-field disabled="true" *ngIf="combinedProperties.rows !== undefined">
        <ng-container>
          <mat-label>{{'rows' | translate }}</mat-label>
          <div class="drop-list" cdkDropList [cdkDropListData]="combinedProperties.rows"
               (cdkDropListDropped)="reorderOptions('rows', $any($event))">
            <div *ngFor="let row of $any(combinedProperties.rows); let i = index" cdkDrag
                 class="list-items" fxLayout="row" fxLayoutAlign="end center">
              <div fxFlex="70">
                {{row.text}}
              </div>
              <button mat-icon-button color="primary"
                      (click)="editRowOption(i)">
                <mat-icon>build</mat-icon>
              </button>
              <button mat-icon-button color="primary"
                      (click)="removeOption('rows', row)">
                <mat-icon>clear</mat-icon>
              </button>
            </div>
          </div>
        </ng-container>
        <div fxLayout="row" fxLayoutAlign="center center">
          <button mat-icon-button matPrefix
                  (click)="addRow(newRow.value); newRow.select()">
            <mat-icon>add</mat-icon>
          </button>
          <input #newRow matInput type="text" placeholder="Fragetext"
                 (keyup.enter)="addRow(newRow.value); newRow.select()">
        </div>
      </mat-form-field>

      <mat-form-field disabled="true" *ngIf="combinedProperties.columns !== undefined">
        <ng-container>
          <mat-label>{{'columns' | translate }}</mat-label>
          <div class="drop-list" cdkDropList [cdkDropListData]="combinedProperties.columns"
               (cdkDropListDropped)="reorderOptions('columns', $any($event))">
            <div *ngFor="let column of $any(combinedProperties.columns); let i = index" cdkDrag
                 class="list-items" fxLayout="row" fxLayoutAlign="end center">
              <div fxFlex="70">
                {{column.text}}
              </div>
              <img [src]="column.imgSrc"
                   [style.object-fit]="'scale-down'"
                   [style.height.px]="40">
              <button mat-icon-button color="primary"
                      (click)="editColumnOption(i)">
                <mat-icon>build</mat-icon>
              </button>
              <button mat-icon-button color="primary"
                      (click)="removeOption('columns', column)">
                <mat-icon>clear</mat-icon>
              </button>
            </div>
          </div>
        </ng-container>
        <div fxLayout="row" fxLayoutAlign="center center">
          <button mat-icon-button matPrefix
                  (click)="addColumn(newColumn.value); newColumn.select()">
            <mat-icon>add</mat-icon>
          </button>
          <input #newColumn matInput type="text" placeholder="Antworttext"
                 (keyup.enter)="addColumn(newColumn.value); newColumn.select()">
        </div>
      </mat-form-field>

      <mat-checkbox *ngIf="combinedProperties.lineColoring !== undefined"
                    [checked]="$any(combinedProperties.lineColoring)"
                    (change)="updateModel.emit({ property: 'lineColoring', value: $event.checked })">
        {{'propertiesPanel.lineColoring' | translate }}
      </mat-checkbox>

      <mat-form-field *ngIf="combinedProperties.lineColoring && combinedProperties.lineColoringColor"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.lineColoringColor' | translate }}</mat-label>
        <input matInput type="color" [value]="combinedProperties.lineColoringColor"
               (input)="updateModel.emit({ property: 'lineColoringColor', value: $any($event.target).value })">
      </mat-form-field>

      <mat-checkbox *ngIf="combinedProperties.magnifier !== undefined"
                    [checked]="$any(combinedProperties.magnifier)"
                    (change)="updateModel.emit({ property: 'magnifier', value: $event.checked })">
        {{'propertiesPanel.magnifier' | translate }}
      </mat-checkbox>
      <mat-form-field *ngIf="combinedProperties.magnifier" appearance="fill">
        <mat-label>{{'propertiesPanel.magnifierSize' | translate }} in px</mat-label>
        <input matInput type="number" #magnifierSize="ngModel" min="0"
               [ngModel]="combinedProperties.magnifierSize"
               (ngModelChange)="updateModel.emit({
                  property: 'magnifierSize',
                  value: $event,
                  isInputValid: magnifierSize.valid})">
      </mat-form-field>

      <ng-container *ngIf="combinedProperties.magnifier">
        {{'propertiesPanel.magnifierZoom' | translate }}
        <mat-slider min="1" max="3" step="0.1" [ngModel]="combinedProperties.magnifierZoom"
                    (change)="updateModel.emit({ property: 'magnifierZoom', value: $event.value })">
        </mat-slider>
        <div *ngIf="combinedProperties.magnifier">
          {{combinedProperties.magnifierZoom}}
        </div>
      </ng-container>

      <mat-form-field disabled="true" *ngIf="combinedProperties.connectedTo !== undefined">
        <ng-container>
          <mat-label>{{'propertiesPanel.connectedDropList' | translate }}</mat-label>
          <div class="drop-list" cdkDropList [cdkDropListData]="combinedProperties.connectedTo"
               (cdkDropListDropped)="reorderOptions('connectedTo', $any($event))">
            <div *ngFor="let connectedTo of $any(combinedProperties.connectedTo); let i = index" cdkDrag
                 class="list-items" fxLayout="row" fxLayoutAlign="end center">
              <div fxFlex="70">
                {{connectedTo}}
              </div>
              <button mat-icon-button color="primary"
                      (click)="editTextOption('connectedTo', i)">
                <mat-icon>build</mat-icon>
              </button>
              <button mat-icon-button color="primary"
                      (click)="removeOption('connectedTo', connectedTo)">
                <mat-icon>clear</mat-icon>
              </button>
            </div>
          </div>
        </ng-container>
        <div fxLayout="row" fxLayoutAlign="center center">
          <button mat-icon-button matPrefix
                  (click)="addOption('connectedTo', newconnectedTo.value); newconnectedTo.select()">
            <mat-icon>add</mat-icon>
          </button>
          <input #newconnectedTo matInput type="text"
                 (keyup.enter)="addOption('connectedTo', newconnectedTo.value); newconnectedTo.select()">
        </div>
      </mat-form-field>

      <mat-form-field *ngIf="combinedProperties.orientation !== undefined"
                      appearance="fill">
        <mat-label>{{'propertiesPanel.alignment' | translate }}</mat-label>
        <mat-select [value]="combinedProperties.orientation"
                    (selectionChange)="updateModel.emit({ property: 'orientation', value: $event.value })">
          <mat-option *ngFor="let option of ['vertical', 'horizontal']"
                      [value]="option">
            {{ 'propertiesPanel.' + option | translate }}
          </mat-option>
        </mat-select>
      </mat-form-field>

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
        <input matInput type="text" [value]="combinedProperties.highlightReceivingDropListColor"
               (input)="updateModel.emit({
                   property: 'highlightReceivingDropListColor',
                   value: $any($event.target).value })">
      </mat-form-field>
    </div>
    `,
  styleUrls: ['./element-model-properties.component.css']
})
export class ElementModelPropertiesComponentComponent {
  @Input() combinedProperties: UIElement = {} as UIElement;
  @Input() selectedElements: UIElement[] = [];
  @Output() updateModel = new EventEmitter<{
    property: string;
    value: InputElementValue | LikertColumn[] | LikertRow[],
    isInputValid?: boolean | null
  }>();

  constructor(public unitService: UnitService) { }

  addOption(property: string, value: string): void {
    (this.combinedProperties[property] as string[]).push(value);
    this.updateModel.emit({ property: property, value: this.combinedProperties[property] as string[] });
  }

  reorderOptions(property: string, event: CdkDragDrop<string[]>): void {
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    this.updateModel.emit({ property: property, value: event.container.data });
  }

  /* Putting the actual types for option does not work because indexOf throws an error
     about the types not being assignable. */
  removeOption(property: string, option: any): void {
    const valueList = this.combinedProperties[property] as string[] | LikertElementRow[] | LikertColumn[];
    valueList.splice(valueList.indexOf(option), 1);
    this.updateModel.emit({ property: property, value: valueList });
  }

  async editTextOption(property: string, optionIndex: number): Promise<void> {
    await this.unitService.editTextOption(property, optionIndex);
  }

  async editColumnOption(optionIndex: number): Promise<void> {
    await this.unitService.editLikertColumn(this.selectedElements as LikertElement[], optionIndex);
  }

  async editRowOption(optionIndex: number): Promise<void> {
    await this.unitService.editLikertRow(
      (this.combinedProperties.rows as LikertElementRow[])[optionIndex] as LikertElementRow,
      this.combinedProperties.columns as LikertColumn[]
    );
  }

  addColumn(value: string): void {
    const column = UnitService.createLikertColumn(value);
    (this.combinedProperties.columns as LikertColumn[]).push(column);
    this.updateModel.emit({ property: 'columns', value: this.combinedProperties.columns as LikertColumn[] });
  }

  addRow(question: string): void {
    const newRow = UnitService.createLikertRow(
      question,
      (this.combinedProperties.columns as LikertColumn[]).length
    );
    (this.combinedProperties.rows as LikertElementRow[]).push(newRow);
    this.updateModel.emit({ property: 'rows', value: this.combinedProperties.rows as LikertElementRow[] });
  }

  async loadImage(): Promise<void> {
    this.updateModel.emit({ property: 'imageSrc', value: await FileService.loadImage() });
  }

  removeImage(): void {
    this.updateModel.emit({ property: 'imageSrc', value: null });
  }
}
