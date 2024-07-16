import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChildren
} from '@angular/core';
import { UIElement } from 'common/models/elements/element';
import { NgForOf, NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { UnitService } from 'editor/src/app/services/unit-services/unit.service';

@Component({
  selector: 'aspect-math-table-properties',
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    MatInputModule,
    MatSelectModule,
    TranslateModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatCheckboxModule
  ],
  template: `
    <div [style.display]="'flex'" [style.flex-direction]="'column'">
      <mat-form-field *ngIf="unitService.expertMode">
        <mat-label>Operation</mat-label>
        <mat-select [value]="combinedProperties.operation"
                    (selectionChange)="updateModel.emit({ property: 'operation', value: $event.value })">
          <mat-option *ngFor="let operation of ['addition', 'subtraction', 'multiplication', 'variable']"
                      [value]="operation">
            {{ operation | translate }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      {{ 'termRows' | translate }}
      <div *ngFor="let term of $any(combinedProperties).terms; let i = index;"
           class="term-list">
        <ng-container *ngIf="combinedProperties.operation !== 'multiplication' || i < 2">
          <mat-form-field (input)="changeTerm($any($event.target).value, i)"
                          [style.flex-grow]="1">
            <mat-label>Term</mat-label>
            <input matInput [value]="term" #termInput>
          </mat-form-field>
          <button mat-icon-button
                  (click)="removeTerm(i)">
            <mat-icon>clear</mat-icon>
          </button>
        </ng-container>
      </div>

      <button mat-button class="add-button"
              [disabled]="combinedProperties.operation === 'multiplication' &&
                          $any(combinedProperties.terms).length >= 2"
              (click)="addTerm()">
        <mat-icon>add</mat-icon>
        {{ 'addTermRow' | translate }}
      </button>

      <mat-form-field (input)="updateModel.emit({ property: 'resultHelperRow', value: $any($event.target).value })">
        <mat-label>{{ 'resultHelperRow' | translate }}</mat-label>
        <input matInput [disabled]="combinedProperties.operation === 'variable' &&
                                    !$any(combinedProperties.variableLayoutOptions).showResultRow"
               [value]="combinedProperties.resultHelperRow">
      </mat-form-field>

      <mat-form-field (input)="updateModel.emit({ property: 'result', value: $any($event.target).value })">
        <mat-label>{{ 'resultRow' | translate }}</mat-label>
        <input matInput [disabled]="combinedProperties.operation === 'variable' &&
                                    !$any(combinedProperties.variableLayoutOptions).showResultRow"
               [value]="combinedProperties.result">
      </mat-form-field>


      <button *ngIf="unitService.expertMode" mat-raised-button color="primary"
              [disabled]="combinedProperties.operation !== 'variable'"
              [matMenuTriggerFor]="variableLayoutOptions">
        Variables Layout anpassen
      </button>
      <mat-menu #variableLayoutOptions="matMenu">
        <mat-checkbox [checked]="$any(combinedProperties.variableLayoutOptions).allowArithmeticChars"
                      (click)="$event.stopPropagation()"
                      (change)="updateModel.emit({ property: 'allowArithmeticChars', value: $event.checked })">
          {{ 'propertiesPanel.allowArithmeticChars' | translate }}
        </mat-checkbox>
        <mat-checkbox [checked]="$any(combinedProperties.variableLayoutOptions).isFirstLineUnderlined"
                      (click)="$event.stopPropagation()"
                      (change)="updateModel.emit({ property: 'isFirstLineUnderlined', value: $event.checked })">
          {{ 'propertiesPanel.isFirstLineUnderlined' | translate }}
        </mat-checkbox>
        <mat-checkbox [checked]="$any(combinedProperties.variableLayoutOptions).showResultRow"
                      (click)="$event.stopPropagation()"
                      (change)="updateModel.emit({ property: 'showResultRow', value: $event.checked })">
          {{ 'propertiesPanel.showResultRowWithHelperRow' | translate }}
        </mat-checkbox>
        <mat-checkbox [checked]="$any(combinedProperties.variableLayoutOptions).showTopHelperRows"
                      (click)="$event.stopPropagation()"
                      (change)="updateModel.emit({ property: 'showTopHelperRows', value: $event.checked })">
          {{ 'propertiesPanel.showTopHelperRows' | translate }}
        </mat-checkbox>
        <mat-checkbox [checked]="$any(combinedProperties.variableLayoutOptions).allowFirstLineCrossOut"
                      (click)="$event.stopPropagation()"
                      (change)="updateModel.emit({ property: 'allowFirstLineCrossOut', value: $event.checked })">
          {{ 'propertiesPanel.allowFirstLineCrossOut' | translate }}
        </mat-checkbox>
      </mat-menu>
    </div>
  `,
  styles: [`
    .term-list {
      display: flex;
      flex-direction: row;
      margin-left: 15px;
    }

    .add-button {
      width: 60%;
      border-radius: 0;
      background-color: lightgray;
      margin-bottom: 20px;
      margin-left: 15px;
      font-size: smaller;
    }
  `
  ]
})
export class MathTablePropertiesComponent {
  @Input() combinedProperties!: UIElement;
  @Output() updateModel =
    new EventEmitter<{ property: string; value: string | string[] | boolean }>();

  @ViewChildren('termInput') termInputs!: QueryList<ElementRef>;

  constructor(public unitService: UnitService) { }

  addTerm() {
    (this.combinedProperties.terms as string[]).push('');
    this.updateModel.emit({ property: 'terms', value: this.combinedProperties.terms as string[] });
  }

  changeTerm(term: string, index: number): void {
    (this.combinedProperties.terms as string[])[index] = term;
    this.updateModel.emit({ property: 'terms', value: this.combinedProperties.terms as string[] });

    setTimeout(() => {
      this.termInputs.toArray()[index].nativeElement.focus();
    });
  }

  removeTerm(index: number) {
    (this.combinedProperties.terms as string[]).splice(index, 1);
    this.updateModel.emit({ property: 'terms', value: this.combinedProperties.terms as string[] });
  }
}
