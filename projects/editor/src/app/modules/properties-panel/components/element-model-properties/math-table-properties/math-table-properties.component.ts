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
import {
  MathTableProperties, VariableLayoutOptions
} from 'common/models/elements/interactive-group-elements/math-table';
import { Merged } from 'editor/src/app/modules/properties-panel/models/merged-properties';

/**
 * What this component may write. The layout switches are read nested, as
 * `variableLayoutOptions.showResultRow`, but written flat: MathTableElement overrides `setProperty`
 * and routes any key of VariableLayoutOptions into that object. So both name spaces are valid here,
 * and a typo in either one is still caught.
 */
type MathTableWritableProperty = keyof MathTableProperties | keyof VariableLayoutOptions;

@Component({
  selector: 'aspect-math-table-properties',
  standalone: false,
  templateUrl: './math-table-properties.component.html',
  styleUrls: ['./math-table-properties.component.scss']
})
export class MathTablePropertiesComponent {
  @Input() combinedProperties!: Merged<MathTableProperties>;
  @Output() updateModel =
    new EventEmitter<{ property: MathTableWritableProperty; value: string | string[] | boolean }>();

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
