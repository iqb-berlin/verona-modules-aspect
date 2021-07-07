import {
  Directive, OnInit
} from '@angular/core';
import { UnitUIElement } from './unit';

@Directive()
export abstract class CanvasElementComponent implements OnInit {
  elementModel!: UnitUIElement;
  style!: Record<string, string>;

  ngOnInit(): void {
    this.updateStyle();
  }

  updateStyle(newProperties: Record<string, string> = {}): void {
    this.style = {
      width: `${this.elementModel.width}px`,
      height: `${this.elementModel.height}px`,
      'background-color': this.elementModel.backgroundColor,
      color: this.elementModel.fontColor,
      'font-family': this.elementModel.font,
      'font-size': `${this.elementModel.fontSize}px`,
      'font-weight': this.elementModel.bold ? 'bold' : '',
      'font-style': this.elementModel.italic ? 'italic' : '',
      'text-decoration': this.elementModel.underline ? 'underline' : '',
      ...this.style,
      ...newProperties
    };
  }
}
