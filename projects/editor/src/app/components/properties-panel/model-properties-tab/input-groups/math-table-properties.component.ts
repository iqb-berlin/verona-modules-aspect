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

@Component({
  selector: 'aspect-math-table-properties',
  template: `
    <div *ngIf="combinedProperties.terms !== undefined"
         [style.display]="'flex'" [style.flex-direction]="'column'">
      <mat-form-field>
        <mat-label>Operation</mat-label>
        <mat-select [value]="combinedProperties.operation"
                    (selectionChange)="updateModel.emit({ property: 'operation', value: $event.value })">
          <mat-option *ngFor="let operation of ['none', 'addition', 'subtraction', 'multiplication']"
                      [value]="operation">
            {{operation | translate}}
          </mat-option>
        </mat-select>
      </mat-form-field>

      {{'termRows' | translate}}
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
        <mat-icon>add</mat-icon>{{'addTermRow' | translate}}
      </button>

      <mat-form-field (input)="updateModel.emit({ property: 'result', value: $any($event.target).value })">
        <mat-label>{{'resultRow' | translate}}</mat-label>
        <input matInput [disabled]="combinedProperties.operation === 'none'" [value]="combinedProperties.result">
      </mat-form-field>

      <mat-checkbox *ngIf="combinedProperties.allowArithmeticChars !== undefined"
                    [disabled]="combinedProperties.operation !== 'none'"
                    [checked]="$any(combinedProperties.allowArithmeticChars)"
                    (change)="updateModel.emit({ property: 'allowArithmeticChars', value: $event.checked })">
        {{'propertiesPanel.allowArithmeticChars' | translate }}
      </mat-checkbox>

      <mat-checkbox *ngIf="combinedProperties.isFirstLineUnderlined !== undefined"
                    [disabled]="combinedProperties.operation !== 'none'"
                    [checked]="$any(combinedProperties.isFirstLineUnderlined)"
                    (change)="updateModel.emit({ property: 'isFirstLineUnderlined', value: $event.checked })">
        {{'propertiesPanel.isFirstLineUnderlined' | translate }}
      </mat-checkbox>
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
