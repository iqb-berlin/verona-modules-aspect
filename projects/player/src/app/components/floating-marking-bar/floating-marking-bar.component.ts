import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CdkOverlayOrigin, ConnectedPosition } from '@angular/cdk/overlay';
import { TextElement } from '../../../../../common/ui-elements/text/text-element';

@Component({
  selector: 'app-floating-marking-bar',
  templateUrl: './floating-marking-bar.component.html',
  styleUrls: ['./floating-marking-bar.component.scss']
})
export class FloatingMarkingBarComponent {
  @Input() elementModel!: TextElement;
  @Input() overlayOrigin!: CdkOverlayOrigin;
  @Input() positions!: ConnectedPosition[];
  @Input() isMarkingBarOpen!: boolean;

  @Output() applySelection = new EventEmitter<{
    active: boolean,
    mode: 'mark' | 'delete',
    color: string
  }>();
}
