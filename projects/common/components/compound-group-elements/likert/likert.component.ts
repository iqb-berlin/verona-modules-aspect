import {
  Component, Input, QueryList, ViewChildren
} from '@angular/core';
import { CompoundElementComponent } from 'common/directives/compound-element.directive';
import { ElementComponent } from 'common/directives/element-component.directive';
import { LikertElement } from 'common/models/elements/compound-group-elements/likert/likert';
import {
  LikertRadioButtonGroupComponent
} from 'common/components/compound-group-elements/likert-radio-button-group/likert-radio-button-group.component';

@Component({
  selector: 'aspect-likert',
  templateUrl: './likert.component.html',
  styleUrls: ['./likert.component.scss'],
  standalone: false
})
export class LikertComponent extends CompoundElementComponent {
  @ViewChildren(LikertRadioButtonGroupComponent) compoundChildren!: QueryList<LikertRadioButtonGroupComponent>;
  @Input() elementModel!: LikertElement;

  getFormElementChildrenComponents(): ElementComponent[] {
    return this.compoundChildren.toArray();
  }
}
