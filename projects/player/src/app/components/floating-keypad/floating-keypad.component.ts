import {
  Component, Input, OnChanges, SimpleChanges
} from '@angular/core';
import { ConnectedPosition, Overlay, RepositionScrollStrategy } from '@angular/cdk/overlay';
import { UIElementType } from 'common/interfaces';
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
      overlayY: 'top',
      offsetX: 0,
      offsetY: 0
    }, {
      originX: 'start',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'bottom',
      offsetX: 0,
      offsetY: 0
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
      const startPosition = this.keypadService.elementComponent.elementModel.inputAssistanceFloatingStartPosition;
      if (startPosition === 'startBottom') {
        this.overlayPositions = FloatingKeypadComponent.overlayPositionsConfig[startPosition]
          .map((position, index) => ({
            ...position,
            offsetY: this.getOffsetY(this.keypadService.elementComponent.elementModel.type, index > 0)
          }));
      } else if (startPosition === 'endCenter') {
        this.overlayPositions = [...FloatingKeypadComponent.overlayPositionsConfig[startPosition]];
      }
    }
  }

  private getOffsetY(type: UIElementType, above: boolean): number {
    switch (type) {
      case 'text-field':
        return above ? -(this.keypadService.inputElement.clientHeight + 2) : 22;
      case 'text-field-simple':
        return above ? -(this.keypadService.inputElement.clientHeight - 24) : 2;
      case 'text-area':
        return above ? -(this.keypadService.inputElement.clientHeight - 10) : 36;
      case 'spell-correct':
        return above ? -(this.keypadService.inputElement.clientHeight - 20) : -34;
      default:
        return 0;
    }
  }
}
