import { Component, OnInit } from '@angular/core';
import { LabelElement } from '../../../model/unit';
import { ElementComponent } from '../element.component';

@Component({
  selector: 'app-template-button',
  template: `
    <div cdkDrag (click)="select($event)"
       (cdkDragEnded)="drop($event)"
       [cdkDragFreeDragPosition]="{x: elementData.xPosition, y: elementData.yPosition}"
       cdkDragBoundary=".elementCanvas"
       [style.width.px]="elementData.width"
       [style.height.px]="elementData.height"
       [style.background-color]="elementData.backgroundColor"
       [style.color]="elementData.fontColor"
       [style.font-family]="elementData.font"
       [style.font-size.px]="elementData.fontSize"
       [style.font-weight]="elementData.bold ? 'bold' : ''"
       [style.font-style]="elementData.italic ? 'italic' : ''"
       [style.text-decoration]="elementData.underline ? 'underline' : ''"
       [ngStyle]="{'border': selected ? '5px solid' : ''}">
      {{elementData.text}}
    </div>
    `
})
export class LabelComponent extends ElementComponent implements OnInit {
  elementData!: LabelElement;

  ngOnInit(): void {
    this.elementData = this.elementModel as unknown as LabelElement;
  }
}
