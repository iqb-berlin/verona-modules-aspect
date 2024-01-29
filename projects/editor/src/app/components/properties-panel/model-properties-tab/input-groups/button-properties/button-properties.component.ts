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
    <ng-container *ngIf="combinedProperties.asLink !== undefined">
      <fieldset>
      <legend>{{'propertiesPanel.presentation' | translate}}</legend>
        <div class="fx-column-start-stretch fx-gap-20">

          <div class="fx-row-space-between-stretch">
            <button mat-button
                    class="fx-fill"
                    [class.checked]="!combinedProperties.imageSrc && !combinedProperties.asLink"
                    (click)="removeImage(); updateModel.emit({ property: 'asLink', value: false });">
              {{'propertiesPanel.button' | translate}}</button>
            <button mat-button class="fx-fill"
                    [class.checked]="!!combinedProperties.imageSrc && !combinedProperties.asLink"
                    (click)="loadImage(); updateModel.emit({ property: 'asLink', value: false });">
              {{'propertiesPanel.image' | translate}}</button>
            <button mat-button
                    class="fx-fill"
                    [class.checked]="!combinedProperties.imageSrc && !!combinedProperties.asLink"
                    (click)="removeImage(); updateModel.emit({ property: 'asLink', value: true });">
              {{'propertiesPanel.link' | translate}}</button>
          </div>

          <div *ngIf="!!combinedProperties.imageSrc">
            <div>
              <button mat-raised-button
                      [disabled]="combinedProperties.asLink"
                      (click)="loadImage()">
                {{'updateImage' | translate }}
              </button>
              <button mat-raised-button
                      class="fx-fill"
                      (click)="removeImage()">
                {{'removeImage' | translate }}
              </button>
            </div>
            <img class="image-preview"
                 [src]="combinedProperties.imageSrc">
          </div>

          <div *ngIf="!combinedProperties.asLink && !combinedProperties.imageSrc">
            <mat-checkbox [checked]="combinedProperties.labelAlignment === 'super'"
                          [disabled]="combinedProperties.labelAlignment === 'sub'"
                          (change)="updateModel.emit({ property: 'labelAlignment',
                                                       value: $event.checked ? 'super' : 'baseline' })">
              {{'propertiesPanel.super' | translate }}
            </mat-checkbox>
            <mat-checkbox [checked]="combinedProperties.labelAlignment === 'sub'"
                          [disabled]="combinedProperties.labelAlignment === 'super'"
                          (change)="updateModel.emit({ property: 'labelAlignment',
                                                       value: $event.checked ? 'sub' : 'baseline' })">
              {{'propertiesPanel.sub' | translate }}
            </mat-checkbox>
          </div>
        </div>
      </fieldset>
      <fieldset>
        <legend>{{'propertiesPanel.tooltip' | translate}}</legend>
        <div class="fx-column-start-stretch">
          <mat-form-field *ngIf="combinedProperties.tooltipText !== undefined">
            <mat-label>{{'propertiesPanel.tooltipText' | translate}}</mat-label>
            <input matInput
                   [ngModel]="combinedProperties.tooltipText"
                   (ngModelChange)="updateModel.emit({ property: 'tooltipText', value: $event })">
          </mat-form-field>
          <mat-form-field *ngIf="combinedProperties.tooltipPosition !== undefined" appearance="fill">
            <mat-label>{{'propertiesPanel.tooltipPosition' | translate }}</mat-label>
            <mat-select [value]="combinedProperties.tooltipPosition"
                        (selectionChange)="updateModel.emit({ property: 'tooltipPosition', value: $event.value })">
              <mat-option *ngFor="let option of ['left', 'right', 'above', 'below']"
                          [value]="option">
                {{ 'propertiesPanel.' + option | translate }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </fieldset>

      <fieldset>
        <legend>{{'propertiesPanel.action' | translate}}</legend>
        <div class="fx-column-start-stretch">
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
                               { id: unitService.unit.stateVariables[0].id, value: '' }"
              (stateVariableChange)="updateModel.emit({ property: 'actionParam', value: $event })">
            </aspect-button-action-param-state-variable>
            <p *ngIf="!unitService.unit.stateVariables.length">{{'propertiesPanel.addStateVariables' | translate}}</p>
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
        </div>
      </fieldset>
    </ng-container>
  `,
  styles: [`
    .checked {
      background-color: #ccc;
    }
    .image-preview  {
      max-width: 100%;
      max-height: 100%;
    }

    .fx-fill {
      flex: 1 1 0;
    }
    .fx-gap-20 {
      gap: 20px;
    }
    .fx-row-space-between-stretch{
      box-sizing: border-box;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: stretch;
    }

    .fx-column-start-stretch {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: stretch;}
  `]
})
export class ButtonPropertiesComponent {
  @Input() combinedProperties!: UIElement;
  @Output() updateModel =
    new EventEmitter<{
      property: string; value: string | number | boolean | StateVariable | null, isInputValid?: boolean | null
    }>();

  hoveringImage = false;
  textComponents: { [id: string]: TextComponent } = {};
  checked = false;

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
