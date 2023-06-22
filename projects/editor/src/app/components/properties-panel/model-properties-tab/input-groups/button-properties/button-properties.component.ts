// eslint-disable-next-line max-classes-per-file
import {
  Component, EventEmitter, Input, Output, Pipe, PipeTransform
} from '@angular/core';
import { FileService } from 'common/services/file.service';
import { UIElement } from 'common/models/elements/element';
import { TextComponent } from 'common/components/text/text.component';
import { Page } from 'common/models/page';
import { StateVariable } from 'common/models/state-variable';
import { UnitService } from '../../../../../services/unit.service';
import { SelectionService } from '../../../../../services/selection.service';

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
          <mat-option *ngFor="let option of ['unitNav', 'pageNav', 'highlightText', 'stateVariableChange']"
                      [value]="option">
            {{ 'propertiesPanel.' + option | translate }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <ng-container *ngIf="combinedProperties.action === 'stateVariableChange'">
        <aspect-button-action-param-state-variable
          *ngIf="unitService.unit.stateVariables.length"
          [stateVariableIds]="unitService.unit.stateVariables | getStateVariableIds"
          [stateVariable]="combinedProperties.actionParam ?
                           $any(combinedProperties.actionParam) :
                           {id: unitService.unit.stateVariables[0].id, value: unitService.unit.stateVariables[0].value}"
          (stateVariableChange)="updateModel.emit({ property: 'actionParam', value: $event })">
        </aspect-button-action-param-state-variable>
        <p *ngIf="!unitService.unit.stateVariables.length">Bitte zuerst Player-Variablen anlegen</p>
      </ng-container>

      <mat-form-field *ngIf="combinedProperties.action !== 'stateVariableChange'"
                      appearance="fill">
        <mat-label>{{'propertiesPanel.actionParam' | translate }}</mat-label>
        <mat-select [disabled]="combinedProperties.action === null"
                    [value]="combinedProperties.actionParam"
                    [matTooltipDisabled]="combinedProperties.action !== 'pageNav'"
                    [matTooltip]="'propertiesPanel.pageNavSelectionHint' | translate"
                    (selectionChange)="updateModel.emit({ property: 'actionParam', value: $event.value })">

          <ng-container *ngIf="combinedProperties.action === 'pageNav'">
            <ng-container *ngFor="let page of (unitService.unit.pages | scrollPages); index as i">
              <mat-option *ngIf="(unitService.unit.pages | scrollPageIndex: selectionService.selectedPageIndex) !== i"
                          [value]="i">
                {{'page' | translate}} {{i + 1}}
              </mat-option>
            </ng-container>
          </ng-container>


          <ng-container *ngIf="combinedProperties.action === 'unitNav'">
            <mat-option *ngFor="let option of [undefined, 'previous', 'next', 'first', 'last', 'end']"
                        [value]="option">
              {{ 'propertiesPanel.' + option | translate }}
            </mat-option>
          </ng-container>

          <ng-container *ngIf="combinedProperties.action === 'highlightText'">
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
    new EventEmitter<{
      property: string; value: string | number | boolean | StateVariable | null, isInputValid?: boolean | null
    }>();

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
  // There can be multiple elements with the same data-anchor-id,
  // since a selected range can include multiple HTMLElements.
  // The first element is filtered out for display in the properties panel.
  transform(textComponents: { [id: string]: TextComponent }): string[] {
    return Object.values(textComponents)
      .map(textComponent => Array.from(textComponent.textContainerRef.nativeElement.querySelectorAll('aspect-anchor'))
        .map(anchor => (anchor as Element).getAttribute('data-anchor-id'))
        .filter((anchorId, index, anchorIds) => anchorIds.indexOf(anchorId) === index) as string[]
      ).flat();
  }
}

@Pipe({
  name: 'scrollPageIndex'
})
export class ScrollPageIndexPipe implements PipeTransform {
  transform(pages: Page[], index: number): number | null {
    if (pages.find((page: Page): boolean => page.alwaysVisible)) {
      return index - 1;
    }
    return index;
  }
}
