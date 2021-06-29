import {
  Directive, Input, OnInit
} from '@angular/core';
import { UnitUIElement } from './unit';

@Directive()
export abstract class CanvasElementComponent implements OnInit {
  @Input() elementModel: UnitUIElement = {} as UnitUIElement;
  style: Record<string, string> = {};

  ngOnInit(): void {
    this.updateStyle();
  }

  updateStyle(): void {
    this.style = {
      width: '100%',
      height: '100%',
      'background-color': this.elementModel.backgroundColor,
      color: this.elementModel.fontColor,
      'font-family': this.elementModel.font,
      'font-size': `${this.elementModel.fontSize}px`,
      'font-weight': this.elementModel.bold ? 'bold' : '',
      'font-style': this.elementModel.italic ? 'italic' : '',
      'text-decoration': this.elementModel.underline ? 'underline' : ''
    };
  }
}
