import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { ButtonElement, ButtonEvent } from 'common/models/elements/button';
import { ElementComponent } from 'common/directives/element-component.directive';

@Component({
  selector: 'aspect-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  standalone: false
})
export class ButtonComponent extends ElementComponent {
  @Input() elementModel!: ButtonElement;
  @Input() clozeContext: boolean = false;
  @Output() buttonActionEvent = new EventEmitter<ButtonEvent>();

  /** A button for unit navigation is hidden by the player while the host does not allow its target. */
  static override startsWithText(element: ButtonElement): boolean {
    return !element.imageSrc && element.action !== 'unitNav' && !!element.label?.trim();
  }
}
