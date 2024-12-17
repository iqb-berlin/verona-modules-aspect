// eslint-disable-next-line max-classes-per-file
import {
  Component, EventEmitter, Input, Output, Pipe, PipeTransform
} from '@angular/core';
import { UIElement } from 'common/models/elements/element';
import { StateVariable } from 'common/models/state-variable';
import { UnitService } from 'editor/src/app/services/unit-services/unit.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { Page } from 'common/models/page';
import { TextElement } from 'common/models/elements/text/text';

@Component({
  selector: 'aspect-action-properties',
  template: `
    <fieldset>
        <legend>{{'propertiesPanel.action' | translate}}</legend>
        <div class="fx-column-start-stretch">
          <mat-form-field *ngIf="combinedProperties.action !== undefined" appearance="fill">
            <mat-label>{{'propertiesPanel.action' | translate }}</mat-label>
            <mat-select [value]="combinedProperties.action"
                        (selectionChange)="resetActionParam();
                                           updateModel.emit({ property: 'action', value: $event.value })">
              <mat-option [value]="null">
                {{ 'propertiesPanel.none' | translate }}
              </mat-option>
              <mat-option *ngFor="let option of actions"
                          [value]="option">
                {{ 'propertiesPanel.' + option | translate }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <ng-container *ngIf="combinedProperties.action === 'stateVariableChange'">
            <aspect-action-param-state-variable
              *ngIf="unitService.unit.stateVariables.length"
              [stateVariables]="unitService.unit.stateVariables"
              [stateVariable]="combinedProperties.actionParam | getStateVariable : unitService.unit.stateVariables"
              (stateVariableChange)="updateModel.emit({ property: 'actionParam', value: $event })">
            </aspect-action-param-state-variable>
            <p *ngIf="!unitService.unit.stateVariables.length">{{'propertiesPanel.addStateVariables' | translate}}</p>
          </ng-container>

          <mat-form-field *ngIf="combinedProperties.action !== 'stateVariableChange' &&
                                 combinedProperties.action !== 'removeHighlights'"
                          appearance="fill">
            <mat-label>{{'propertiesPanel.actionParam' | translate }}</mat-label>
            <mat-select [disabled]="combinedProperties.action === null"
                        [value]="combinedProperties.actionParam"
                        [matTooltipDisabled]="combinedProperties.action !== 'pageNav'"
                        [matTooltip]="'propertiesPanel.pageNavSelectionHint' | translate"
                        (selectionChange)="updateModel.emit({ property: 'actionParam', value: $event.value })">

              <ng-container *ngIf="combinedProperties.action === 'pageNav'">
                <ng-container *ngFor="let page of (unitService.unit.pages | scrollPages); index as i">
                  <mat-option *ngIf="(unitService.unit.pages |
                                      scrollPageIndex: selectionService.selectedPageIndex) !== i"
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
                <mat-option *ngFor="let option of anchorIds"
                            [value]="option">
                  {{ option  }}
                </mat-option>
              </ng-container>

            </mat-select>
          </mat-form-field>
        </div>
      </fieldset>
  `
})

export class ActionPropertiesComponent {
  @Input() combinedProperties!: UIElement;
  @Input() actions!: string[];
  @Output() updateModel =
    new EventEmitter<{
      property: string; value: string | number | boolean | StateVariable | null, isInputValid?: boolean | null
    }>();

  resetActionParam(): void {
    this.updateModel.emit({ property: 'actionParam', value: null });
  }

  anchorIds: string[] = [];

  constructor(public unitService: UnitService, public selectionService: SelectionService) {
    this.anchorIds = (unitService.unit.getAllElements('text') as TextElement[])
      .flatMap(textElement => textElement.getAnchorIDs());
  }
}

@Pipe({
  name: 'getStateVariable'
})
export class GetStateVariablePipe implements PipeTransform {
  transform(actionParam: unknown, stateVariables: StateVariable[]): StateVariable {
    if (actionParam && typeof actionParam === 'object') return actionParam as StateVariable;
    return new StateVariable(stateVariables[0].id, stateVariables[0].alias, '');
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
