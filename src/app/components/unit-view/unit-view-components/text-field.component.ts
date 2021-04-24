import { Component, OnInit } from '@angular/core';
import { ElementComponent } from '../element.component';
import { TextFieldElement } from '../../../model/unit';

@Component({
  selector: 'app-template-button',
  template: `
    <input matInput cdkDrag (click)="select()"
       (cdkDragEnded)="drop($event)"
       [cdkDragFreeDragPosition]="{x: elementData.xPosition, y: elementData.yPosition}"
       cdkDragBoundary=".elementCanvas"
       [style.width.px]="elementData.width"
       [style.height.px]="elementData.height"
       [style.background-color]="elementData.backgroundColor">
    `
})
export class TextFieldComponent extends ElementComponent implements OnInit {
  elementData!: TextFieldElement;

  ngOnInit(): void {
    this.elementData = this.element as unknown as TextFieldElement;
  }

  select(): void {
    this.elementSelected.emit(this as unknown as TextFieldElement);
  }
}
