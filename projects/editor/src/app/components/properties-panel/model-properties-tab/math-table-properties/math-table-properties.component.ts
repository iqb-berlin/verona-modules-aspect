import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChildren
} from '@angular/core';
import { UnitService } from 'editor/src/app/services/unit.service';
import { MathTableProperties } from 'common/models/elements/interactive-group-elements/math-table';
import { Merged } from 'editor/src/app/components/properties-panel/models/merged-properties';

@Component({
  selector: 'aspect-math-table-properties',
  standalone: false,
  templateUrl: './math-table-properties.component.html',
  styleUrls: ['./math-table-properties.component.scss']
})
export class MathTablePropertiesComponent {
  @Input() combinedProperties!: Merged<MathTableProperties>;
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
