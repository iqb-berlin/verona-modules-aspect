import { Component, Input } from '@angular/core';
import { FrameElement } from 'common/models/elements/base-group-elements/frame';
import { ElementComponent } from 'common/directives/element-component.directive';

@Component({
  selector: 'aspect-frame',
  templateUrl: './frame.component.html',
  standalone: false
})
export class FrameComponent extends ElementComponent {
  @Input() elementModel!: FrameElement;
}
