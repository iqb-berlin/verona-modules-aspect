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
          .map((position, index) => (
            { ...position, offsetY: this.getOffsetY(index) }
          ));
      } else {
        this.overlayPositions = [...FloatingKeypadComponent.overlayPositionsConfig[startPosition]];
      }
    }
  }

  private getOffsetY(index: number): number {
    if (index > 0) {
      let positionOffset = 0;
      if (this.keypadService.elementComponent.elementModel.type === 'text-field') {
        positionOffset = 20;
      } else if (this.keypadService.elementComponent.elementModel.type === 'text-field-simple') {
        positionOffset = -22;
      }
      return -(this.keypadService.inputElement.clientHeight + positionOffset);
    }
    return this.keypadService.elementComponent.elementModel.type === 'text-field' ? 26 : 8;
  }
}
