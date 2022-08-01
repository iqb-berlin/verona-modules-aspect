import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { FileService } from 'common/services/file.service';
import { UIElement } from 'common/models/elements/element';
import { UnitService } from '../../../../services/unit.service';
import { SelectionService } from '../../../../services/selection.service';

@Component({
  selector: 'aspect-button-properties',
  template: `
    <fieldset *ngIf="combinedProperties.asLink !== undefined">
      <legend>Knopf</legend>

      <mat-checkbox *ngIf="combinedProperties.asLink !== undefined"
                    [checked]="$any(combinedProperties).asLink"
                    (change)="updateModel.emit({ property: 'asLink', value: $event.checked })">
        {{'propertiesPanel.asLink' | translate }}
      </mat-checkbox>

      <mat-form-field *ngIf="combinedProperties.action !== undefined" appearance="fill">
        <mat-label>{{'propertiesPanel.action' | translate }}</mat-label>
        <mat-select [value]="combinedProperties.action"
                    (selectionChange)="updateModel.emit({ property: 'action', value: $event.value })">
          <mat-option [value]="null">
            {{ 'propertiesPanel.none' | translate }}
          </mat-option>
          <mat-option *ngFor="let option of ['unitNav', 'pageNav']"
                      [value]="option">
            {{ 'propertiesPanel.' + option | translate }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="fill">
        <mat-label>{{'propertiesPanel.actionParam' | translate }}</mat-label>
          <mat-select [disabled]="combinedProperties.action === null"
                      [value]="combinedProperties.actionParam"
                      [matTooltipDisabled]="combinedProperties.action !== 'pageNav'"
                      [matTooltip]="'propertiesPanel.pageNavSelectionHint' | translate"
                      (selectionChange)="updateModel.emit({ property: 'actionParam', value: $event.value })">

            <ng-container *ngIf="combinedProperties.action === 'pageNav'">
              <ng-container *ngFor="let page of unitService.unit.pages; index as i">
                <mat-option *ngIf="!page.alwaysVisible && selectionService.selectedPageIndex !== i"
                            [value]="i">
                  {{ unitService.unit.pages[0].alwaysVisible ? i : i + 1 }}
                </mat-option>
              </ng-container>
            </ng-container>

            <ng-container *ngIf="combinedProperties.action === 'unitNav'">
              <mat-option *ngFor="let option of [undefined, 'previous', 'next', 'first', 'last', 'end']"
                          [value]="option">
                {{ 'propertiesPanel.' + option | translate }}
              </mat-option>
            </ng-container>
          </mat-select>
      </mat-form-field>

      <div class="image-panel" (mouseenter)="hoveringImage = true" (mouseleave)="hoveringImage = false">
        <button *ngIf="combinedProperties.imageSrc === null || hoveringImage"
                class="add-image-button" mat-raised-button
                (click)="loadImage()">{{'loadImage' | translate }}</button>
        <button *ngIf="combinedProperties.imageSrc !== null && hoveringImage"
                class="remove-image-button" mat-raised-button
                (click)="removeImage()">{{'removeImage' | translate }}</button>
        <img *ngIf="combinedProperties.imageSrc"
             [src]="combinedProperties.imageSrc">
      </div>
    </fieldset>
  `,
  styles: [
    'mat-checkbox {margin-bottom: 10px;}',
    'mat-form-field {width: 100%;}',
    '.image-panel {width: 250px; height: 150px; border: 1px solid; text-align: center; position: relative;}',
    '.image-panel .add-image-button {position: absolute; left: 50%; top: 35%; transform: translate(-50%, -35%);}',
    '.image-panel .remove-image-button {position: absolute; left: 50%; top: 70%; transform: translate(-50%, -70%);}',
    '.image-panel img {width:100%; height:100%;}'
  ]
})
export class ButtonPropertiesComponent {
  @Input() combinedProperties!: UIElement;
  @Output() updateModel =
    new EventEmitter<{ property: string; value: string | number | boolean | null, isInputValid?: boolean | null }>();

  hoveringImage = false;

  constructor(public unitService: UnitService, public selectionService: SelectionService) { }

  async loadImage(): Promise<void> {
    this.updateModel.emit({ property: 'imageSrc', value: await FileService.loadImage() });
  }

  removeImage(): void {
    this.updateModel.emit({ property: 'imageSrc', value: null });
  }
}
