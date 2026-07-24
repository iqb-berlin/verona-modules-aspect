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
import { UnitService } from 'editor/src/app/services/unit.service';

@Component({
  selector: 'aspect-math-table-properties',
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
  templateUrl: './math-table-properties.component.html',
  styleUrls: ['./math-table-properties.component.scss']
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

  // eslint-disable-next-line class-methods-use-this
  trackTerm(index: number) {
    return index;
  }
}
