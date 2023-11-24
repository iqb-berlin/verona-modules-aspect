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
          <mat-option *ngFor="let operation of ['addition', 'subtraction', 'multiplication']" [value]="operation">
            {{operation | translate}}
          </mat-option>
        </mat-select>
      </mat-form-field>

      Terme
      <div *ngFor="let term of $any(combinedProperties).terms; let i = index;"
           class="term-list">
        <ng-container *ngIf="combinedProperties.operation !== 'multiply' || i < 2">
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
              (click)="addTerm()">
        <mat-icon>add</mat-icon> Term hinzufügen
      </button>

      <mat-form-field (input)="updateModel.emit({ property: 'result', value: $any($event.target).value })">
        <mat-label>Ergebnis</mat-label>
        <input matInput type="number" [value]="combinedProperties.result">
      </mat-form-field>
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
    new EventEmitter<{ property: string; value: string | string[] }>();

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
