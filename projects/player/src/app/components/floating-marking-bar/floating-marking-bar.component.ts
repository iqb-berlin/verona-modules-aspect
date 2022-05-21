import {
  Component, EventEmitter, Input, OnChanges, Output, SimpleChanges
} from '@angular/core';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { TextComponent } from 'common/components/text/text.component';

@Component({
  selector: 'aspect-floating-marking-bar',
  templateUrl: './floating-marking-bar.component.html',
  styleUrls: ['./floating-marking-bar.component.scss']
})
export class FloatingMarkingBarComponent implements OnChanges {
  @Input() elementComponent!: TextComponent;
  @Input() isMarkingBarOpen!: boolean;
  @Input() markingBarPosition!: { top: number, left: number };
  @Input() textComponentRect!: DOMRect;
  @Input() textComponentContainerScrollTop!: number;

  @Output() markingDataChanged = new EventEmitter<{
    active: boolean,
    mode: 'mark' | 'delete',
    color: string
    colorName: string | undefined;
  }>();

  overlayPositions: ConnectedPosition[] = [{
    originX: 'start',
    originY: 'top',
    overlayX: 'start',
    overlayY: 'top',
    offsetX: 0,
    offsetY: 0
  }];


  ngOnChanges(changes: SimpleChanges): void {
    if (changes.isMarkingBarOpen && this.isMarkingBarOpen) {
      this.correctMarkingBarPosition();
    }
  }

  private getBarWidth(): number {
    return (1 + [
      this.elementComponent.elementModel.highlightableYellow,
      this.elementComponent.elementModel.highlightableTurquoise,
      this.elementComponent.elementModel.highlightableOrange
    ].filter(element => element).length) * 60;
  }

  private correctMarkingBarPosition(): void {
    const convertMarkingBarPosition = this.convertMarkingBarPositionToTextComponentRect();
    const barConstraint = this.getBarConstraint();
    this.overlayPositions[0].offsetX =
      barConstraint.left < convertMarkingBarPosition.left ? barConstraint.left : convertMarkingBarPosition.left;
    this.overlayPositions[0].offsetY = barConstraint.top < convertMarkingBarPosition.top ?
      barConstraint.top - 50 + this.textComponentContainerScrollTop :
      convertMarkingBarPosition.top + this.textComponentContainerScrollTop;
  }

  private getViewConstraint(): { top: number, left: number } {
    return  {
      top: window.innerHeight - this.textComponentRect.top > this.textComponentRect.height ?
        this.textComponentRect.height :
        window.innerHeight - this.textComponentRect.top,
      left: this.textComponentRect.width
    };
  }

  private getBarConstraint(): { top: number, left: number } {
    const viewConstraint = this.getViewConstraint();
    return { top: viewConstraint.top - 100, left: viewConstraint.left - this.getBarWidth() };
  }

  private convertMarkingBarPositionToTextComponentRect(): { top: number, left: number } {
    return {
      left: this.markingBarPosition.left - this.textComponentRect.left,
      top: this.markingBarPosition.top - this.textComponentRect.top + 15
    };
  }
}
