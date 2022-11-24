import {
  Component, EventEmitter, Input, Output, Pipe, PipeTransform
} from '@angular/core';
import { FileService } from 'common/services/file.service';
import { UIElement } from 'common/models/elements/element';
import { TextComponent } from 'common/components/text/text.component';
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
          <mat-option *ngFor="let option of ['unitNav', 'pageNav', 'scrollTo']"
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

            <ng-container *ngIf="combinedProperties.action === 'scrollTo'">
              <mat-option *ngFor="let option of (textComponents | getAnchorIds) "
                          [value]="option">
                {{ option  }}
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
  `
})
export class ButtonPropertiesComponent {
  @Input() combinedProperties!: UIElement;
  @Output() updateModel =
    new EventEmitter<{ property: string; value: string | number | boolean | null, isInputValid?: boolean | null }>();

  hoveringImage = false;
  textComponents: { [id: string]: TextComponent } = {};

  constructor(public unitService: UnitService, public selectionService: SelectionService) {
    this.textComponents = TextComponent.textComponents;
  }

  async loadImage(): Promise<void> {
    this.updateModel.emit({ property: 'imageSrc', value: await FileService.loadImage() });
  }

  removeImage(): void {
    this.updateModel.emit({ property: 'imageSrc', value: null });
  }
}

@Pipe({
  name: 'getAnchorIds'
})
export class GetAnchorIdsPipe implements PipeTransform {
  transform(textComponents: { [id: string]: TextComponent }): string[] {
    return Object.values(textComponents)
      .map(textComponent => Array.from(textComponent.textContainerRef.nativeElement.querySelectorAll('aspect-anchor'))
        .map(anchor => (anchor as Element).getAttribute('data-anchor-id'))
        .filter((anchorId, index, anchorIds) => anchorIds.indexOf(anchorId) === index) as string[]
      ).flat();
  }
}
