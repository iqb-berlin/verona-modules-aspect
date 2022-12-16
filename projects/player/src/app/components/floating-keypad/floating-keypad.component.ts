import {
  Component, Input, OnChanges, SimpleChanges
} from '@angular/core';
import { ConnectedPosition, Overlay, RepositionScrollStrategy } from '@angular/cdk/overlay';
import { KeypadService } from '../../services/keypad.service';

@Component({
  selector: 'aspect-floating-keypad',
  templateUrl: './floating-keypad.component.html',
  styleUrls: ['./floating-keypad.component.scss']
})
export class FloatingKeypadComponent implements OnChanges {
  @Input() isKeypadOpen!: boolean;

  repositionScrollStrategy: RepositionScrollStrategy;
  overlayPositions: ConnectedPosition[] = [];

  private static overlayPositionsConfig: { startBottom: ConnectedPosition[], endCenter: ConnectedPosition[] } = {
    startBottom: [{
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top'
    }, {
      originX: 'start',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'bottom'
    }],
    endCenter: [{
      originX: 'end',
      originY: 'center',
      overlayX: 'start',
      overlayY: 'center'
    }]
  };

  constructor(
    private overlay: Overlay,
    public keypadService: KeypadService
  ) {
    this.repositionScrollStrategy = overlay.scrollStrategies.reposition();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.isKeypadOpen && this.isKeypadOpen) {
      this.overlayPositions = FloatingKeypadComponent
        .overlayPositionsConfig[this.keypadService.elementComponent.elementModel.inputAssistanceFloatingStartPosition];
    }
  }
}
