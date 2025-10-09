// eslint-disable-next-line max-classes-per-file
import {
  Component, EventEmitter, Input, Output, Pipe, PipeTransform, ViewChild
} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { CombinedProperties } from 'editor/src/app/components/properties-panel/element-properties-panel.component';
import { IDService } from 'editor/src/app/services/id.service';
import { NgForOf, NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { OptionListPanelComponent } from 'editor/src/app/components/properties-panel/option-list-panel.component';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UnitService } from 'editor/src/app/services/unit-services/unit.service';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { ElementService } from 'editor/src/app/services/unit-services/element.service';
import { DragNDropValueObject, TextImageLabel } from 'common/interfaces';

@Pipe({
  name: 'getValidDropLists',
  standalone: true
})
export class GetValidDropListsPipe implements PipeTransform {
  constructor(private unitService: UnitService) {}

  transform(idList: string[] | undefined): { id: string, alias: string }[] {
    if (!idList) return [];
    return this.unitService.getAllDropListElementIDs()
      .filter(dropListIDPair => !idList.includes(dropListIDPair.id));
  }
}

@Component({
    selector: 'aspect-drop-list-properties',
    imports: [
        NgIf,
        TranslateModule,
        MatInputModule,
        MatSelectModule,
        MatCheckboxModule,
        OptionListPanelComponent,
        FormsModule,
        MatButtonModule,
        NgForOf,
        MatTooltipModule,
        GetValidDropListsPipe
    ],
    template: `
    <div *ngIf="combinedProperties.type === 'drop-list'"
         class="fx-column-start-stretch">
      <aspect-option-list-panel [title]="'preset'" [textFieldLabel]="'Neue Option'"
                                [itemList]="$any(combinedProperties.value)"
                                (textItemAdded)="addOption($event)"
                                (itemRemoved)="removeOption($event)"
                                (itemReordered)="moveOption('value', $event)"
                                (itemEdited)="editOption($event)">
      </aspect-option-list-panel>

      <mat-form-field *ngIf="combinedProperties.connectedTo !== null"
                      class="wide-form-field" appearance="fill">
        <mat-label>{{'propertiesPanel.connectedDropLists' | translate }}</mat-label>
        <mat-select #selectConnectedLists multiple
                    [ngModel]="combinedProperties.connectedTo"
                    (ngModelChange)="toggleConnectedDropList($event)">
          <mat-select-trigger>
            {{'propertiesPanel.connectedDropLists' | translate }} ({{$any(combinedProperties.connectedTo).length}})
          </mat-select-trigger>
          <button mat-stroked-button [style.margin-bottom.px]="5"
                  (click)="toggleSelectAll()">
            Alle Auswählen
          </button>
          <mat-option *ngFor="let idPair of (combinedProperties.idList | getValidDropLists)" [value]="idPair.id">
            {{idPair.alias}}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field *ngIf="combinedProperties.orientation !== undefined"
                      appearance="fill">
        <mat-label>{{'propertiesPanel.alignment' | translate }}</mat-label>
        <mat-select [value]="combinedProperties.orientation"
                    (selectionChange)="updateModel.emit({ property: 'orientation', value: $event.value })">
          <mat-option *ngFor="let option of ['vertical', 'horizontal', 'flex']"
                      [value]="option">
            {{ 'propertiesPanel.' + option | translate }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <mat-checkbox *ngIf="unitService.expertMode && combinedProperties.isSortList !== undefined"
                    [disabled]="$any(combinedProperties.permanentPlaceholders)"
                    [checked]="$any(combinedProperties.isSortList)"
                    (change)="updateModel.emit({ property: 'isSortList', value: $event.checked })">
        {{'propertiesPanel.isSortList' | translate }}
      </mat-checkbox>

      <mat-checkbox *ngIf="unitService.expertMode && combinedProperties.onlyOneItem !== undefined"
                    [checked]="$any(combinedProperties.onlyOneItem)"
                    (change)="updateOnlyOneItem($event.checked)">
        {{'propertiesPanel.onlyOneItem' | translate }}
      </mat-checkbox>

      <mat-checkbox *ngIf="unitService.expertMode && combinedProperties.allowReplacement !== undefined"
                    [disabled]="$any(combinedProperties.permanentPlaceholders)"
                    [checked]="$any(combinedProperties.allowReplacement)"
                    (change)="updateAllowReplacement($event.checked)">
        {{'allowReplacement' | translate }}
      </mat-checkbox>

      <mat-checkbox *ngIf="unitService.expertMode && combinedProperties.copyOnDrop !== undefined"
                    [disabled]="$any(combinedProperties.permanentPlaceholders)"
                    [checked]="$any(combinedProperties.copyOnDrop)"
                    (change)="updateModel.emit({ property: 'copyOnDrop', value: $event.checked })">
        {{'propertiesPanel.copyOnDrop' | translate }}
      </mat-checkbox>

      <mat-checkbox *ngIf="unitService.expertMode && combinedProperties.permanentPlaceholders !== undefined"
                    [disabled]="$any(combinedProperties.copyOnDrop) ||
                                $any(combinedProperties.isSortList) ||
                                $any(combinedProperties.allowReplacement)"
                    [checked]="$any(combinedProperties.permanentPlaceholders)"
                    (change)="updateModel.emit({ property: 'permanentPlaceholders', value: $event.checked })">
        {{'propertiesPanel.permanentPlaceholders' | translate }}
      </mat-checkbox>
      <mat-checkbox *ngIf="unitService.expertMode && combinedProperties.permanentPlaceholdersCC !== undefined"
                    [disabled]="!combinedProperties.permanentPlaceholders"
                    [checked]="$any(combinedProperties.permanentPlaceholdersCC)"
                    (change)="updateModel.emit({ property: 'permanentPlaceholdersCC', value: $event.checked })">
        {{'propertiesPanel.permanentPlaceholdersCC' | translate }}
      </mat-checkbox>

      <mat-checkbox *ngIf="unitService.expertMode && combinedProperties.showNumbering !== undefined"
                    [checked]="$any(combinedProperties.showNumbering)"
                    (change)="updateModel.emit({ property: 'showNumbering', value: $event.checked })">
        {{'propertiesPanel.showNumbering' | translate }}
      </mat-checkbox>

      <mat-checkbox *ngIf="unitService.expertMode && combinedProperties.startNumberingAtZero !== undefined"
                    [disabled]="!$any(combinedProperties.showNumbering)"
                    [checked]="$any(combinedProperties.startNumberingAtZero)"
                    (change)="updateModel.emit({ property: 'startNumberingAtZero', value: $event.checked })">
        {{'propertiesPanel.startNumberingAtZero' | translate }}
      </mat-checkbox>

      <mat-checkbox *ngIf="unitService.expertMode && combinedProperties.highlightReceivingDropList !== undefined"
                    [checked]="$any(combinedProperties.highlightReceivingDropList)"
                    (change)="updateModel.emit({ property: 'highlightReceivingDropList', value: $event.checked })">
        {{'propertiesPanel.highlightReceivingDropList' | translate }}
      </mat-checkbox>
      <mat-form-field *ngIf="unitService.expertMode" appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.highlightReceivingDropListColor' | translate }}</mat-label>
        <input matInput type="text"
               [disabled]="!combinedProperties.highlightReceivingDropList"
               [value]="$any(combinedProperties.highlightReceivingDropListColor)"
               (input)="updateModel.emit({
                     property: 'highlightReceivingDropListColor',
                     value: $any($event.target).value })">
      </mat-form-field>
    </div>
  `
})
export class DropListPropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel = new EventEmitter<{
    property: string;
    value: string | number | boolean | string[] | DragNDropValueObject[],
    isInputValid?: boolean | null
  }>();

  @ViewChild('selectConnectedLists') selectConnected!: MatSelect;

  constructor(public unitService: UnitService,
              private elementService: ElementService,
              private dialogService: DialogService,
              private idService: IDService) { }

  updateAllowReplacement(value: boolean) {
    if (value) this.updateOnlyOneItem(true);
    this.updateModel.emit({ property: 'allowReplacement', value });
  }

  updateOnlyOneItem(value: boolean) {
    if (!value) this.updateAllowReplacement(false);
    this.updateModel.emit({ property: 'onlyOneItem', value });
  }

  addOption(value: string): void {
    this.updateModel.emit({
      property: 'value',
      value: [
        ...this.combinedProperties.value as DragNDropValueObject[],
        {
          text: value,
          imgSrc: null,
          imgFileName: '',
          audioSrc: null,
          audioFileName: '',
          imgPosition: 'above',
          ...this.idService.getAndRegisterNewIDs('value'),
          originListID: 'id_placeholder',
          originListIndex: 0
        }
      ]
    });
  }

  moveOption(property: string, indices: { previousIndex: number, currentIndex: number }): void {
    moveItemInArray(this.combinedProperties[property] as TextImageLabel[],
      indices.previousIndex,
      indices.currentIndex);
    this.updateModel.emit({ property: property, value: this.combinedProperties[property] as DragNDropValueObject[] });
  }

  async editOption(optionIndex: number): Promise<void> {
    const dropListValues: DragNDropValueObject[] = this.combinedProperties.value as DragNDropValueObject[];

    this.dialogService.showDropListOptionEditDialog(dropListValues[optionIndex])
      .subscribe((result: DragNDropValueObject) => {
        if (result) {
          this.elementService.updateDropListValueObject(optionIndex, result);
        }
      });
  }

  removeOption(optionIndex: number): void {
    const valueList = this.combinedProperties.value as DragNDropValueObject[];
    this.idService.unregister(valueList[optionIndex].id, true, false);
    this.idService.unregister(valueList[optionIndex].alias, false, true);
    valueList.splice(optionIndex, 1);
    this.updateModel.emit({ property: 'value', value: valueList });
  }

  toggleConnectedDropList(connectedDropListList: string[]) {
    this.updateModel.emit({
      property: 'connectedTo',
      value: connectedDropListList
    });
  }

  toggleSelectAll() {
    this.selectConnected.options.forEach((item: MatOption) => item.select());
  }
}
