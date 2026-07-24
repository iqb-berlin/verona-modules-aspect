import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { ButtonElement, ButtonEvent } from 'common/models/elements/button/button';
import { ElementComponent } from 'common/directives/element-component.directive';

@Component({
  selector: 'aspect-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  standalone: false
})
export class ButtonComponent extends ElementComponent {
  @Input() elementModel!: ButtonElement;
  @Output() buttonActionEvent = new EventEmitter<ButtonEvent>();
}
