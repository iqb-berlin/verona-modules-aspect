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
       [ngStyle]="style">
      {{elementData.text}}
    </div>
    `
})
export class LabelComponent extends ElementComponent implements OnInit {
  elementData!: LabelElement;

  ngOnInit(): void {
    this.elementData = this.elementModel as unknown as LabelElement;
    this.updateStyle();
  }
}
