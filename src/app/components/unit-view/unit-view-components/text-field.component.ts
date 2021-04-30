import { Component, OnInit } from '@angular/core';
import { ElementComponent } from '../element.component';
import { TextFieldElement } from '../../../model/unit';

@Component({
  selector: 'app-template-button',
  template: `
    <input matInput cdkDrag (click)="select($event)"
       (cdkDragEnded)="drop($event)"
       [cdkDragFreeDragPosition]="{x: elementData.xPosition, y: elementData.yPosition}"
       cdkDragBoundary=".elementCanvas"
       [ngStyle]="style">
    `
})
export class TextFieldComponent extends ElementComponent implements OnInit {
  elementData!: TextFieldElement;

  ngOnInit(): void {
    this.elementData = this.elementModel as unknown as TextFieldElement;
    this.updateStyle();
  }
}
