import { Component, OnInit } from '@angular/core';
import { LabelElement } from '../../../model/unit';
import { ElementComponent } from '../element.component';

@Component({
  selector: 'app-template-button',
  template: `
    <div cdkDrag (click)="select()"
       (cdkDragEnded)="drop($event)"
       [cdkDragFreeDragPosition]="{x: elementData.xPosition, y: elementData.yPosition}"
       cdkDragBoundary=".elementCanvas"
       [style.width.px]="elementData.width"
       [style.height.px]="elementData.height"
       [style.background-color]="elementData.backgroundColor">
      {{elementData.text}}
    </div>
    `
})
export class LabelComponent extends ElementComponent implements OnInit {
  elementData!: LabelElement;

  ngOnInit(): void {
    this.elementData = this.element as unknown as LabelElement;
  }

  select(): void {
    this.elementSelected.emit(this as unknown as LabelElement);
  }
}
