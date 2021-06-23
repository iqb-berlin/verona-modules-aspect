import {
  Directive, Output, EventEmitter, Input
} from '@angular/core';
import { UnitUIElement } from '../../../../../../../common/unit';

@Directive()
export abstract class CanvasElementComponent {
  @Input() elementModel!: UnitUIElement;
  @Input() draggable!: boolean;
  @Output() elementSelected = new EventEmitter<{ componentElement: CanvasElementComponent, multiSelect: boolean }>();

  style: Record<string, string> = {};
  _selected = false;

  set selected(newValue: boolean) {
    this._selected = newValue;
    this.updateStyle();
  }

  get selected(): boolean {
    return this._selected;
  }

  click(event: MouseEvent): void {
    if (event.shiftKey) {
      this.elementSelected.emit({ componentElement: this, multiSelect: true });
    } else {
      this.elementSelected.emit({ componentElement: this, multiSelect: false });
    }
  }

  updateStyle(): void {
    this.style = {
      border: this.selected ? '5px solid' : '',
      width: `${this.elementModel.width}px`,
      height: `${this.elementModel.height}px`,
      'background-color': this.elementModel.backgroundColor,
      color: this.elementModel.fontColor,
      'font-family': this.elementModel.font,
      'font-size': `${this.elementModel.fontSize}px`,
      'font-weight': this.elementModel.bold ? 'bold' : '',
      'font-style': this.elementModel.italic ? 'italic' : '',
      'text-decoration': this.elementModel.underline ? 'underline' : '',
      left: `${this.elementModel.xPosition.toString()}px`,
      top: `${this.elementModel.yPosition.toString()}px`
    };
  }
}
