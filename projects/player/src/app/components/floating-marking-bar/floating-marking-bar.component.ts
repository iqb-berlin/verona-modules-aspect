import {
  Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges
} from '@angular/core';
import { CdkOverlayOrigin, ConnectedPosition } from '@angular/cdk/overlay';
import { TextElement } from '../../../../../common/ui-elements/text/text-element';
import { ElementComponent } from '../../../../../common/directives/element-component.directive';
import { TextComponent } from '../../../../../common/ui-elements/text/text.component';

@Component({
  selector: 'app-floating-marking-bar',
  templateUrl: './floating-marking-bar.component.html',
  styleUrls: ['./floating-marking-bar.component.scss']
})
export class FloatingMarkingBarComponent implements OnInit, OnChanges {
  @Input() elementComponent!: ElementComponent;
  @Input() overlayOrigin!: CdkOverlayOrigin;
  @Input() isMarkingBarOpen!: boolean;
  @Input() position!: { top: number, left: number };

  @Output() applySelection = new EventEmitter<{
    active: boolean,
    mode: 'mark' | 'delete',
    color: string
    colorName: string | undefined;
  }>();

  elementModel!: TextElement;
  positions: ConnectedPosition[] = [{
    originX: 'start',
    originY: 'top',
    overlayX: 'start',
    overlayY: 'top',
    offsetX: 0,
    offsetY: 0
  }];

  ngOnInit(): void {
    this.elementModel = (this.elementComponent as TextComponent).elementModel;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.isMarkingBarOpen && this.isMarkingBarOpen) {
      this.calculatePosition();
    }
  }

  private calculateOffset(): number {
    return (1 + [
      this.elementModel.highlightableYellow,
      this.elementModel.highlightableTurquoise,
      this.elementModel.highlightableOrange
    ].filter(element => element).length) * 60;
  }

  private calculatePosition(): void {
    const rect = (this.elementComponent.domElement.getBoundingClientRect());
    const viewConstraint = {
      top: window.innerHeight - rect.top > rect.height ? rect.height : window.innerHeight - rect.top,
      left: window.innerWidth - rect.left > rect.width ? rect.width : window.innerWidth - rect.width
    };
    const barConstraint = { top: viewConstraint.top - 100, left: viewConstraint.left - this.calculateOffset() };
    const left = this.position.left - rect.left;
    const top = this.position.top - rect.top + 15;
    this.positions[0].offsetX = barConstraint.left < left ? barConstraint.left : left;
    this.positions[0].offsetY = barConstraint.top < top ? barConstraint.top - 50 : top;
  }
}
