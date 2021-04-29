import {
  Component, OnInit
} from '@angular/core';
import { ElementComponent } from '../element.component';
import { ButtonElement, UnitUIElement } from '../../../model/unit';

@Component({
  selector: 'app-template-button',
  template: `
      <button mat-button cdkDrag (click)="select($event)"
            (cdkDragEnded)="drop($event)"
            [cdkDragFreeDragPosition]="{x: elementData.xPosition, y: elementData.yPosition}"
            cdkDragBoundary=".elementCanvas"
            [style.width.px]="elementData.width"
            [style.height.px]="elementData.height"
            [style.background-color]="elementData.backgroundColor"
            [style.font-family]="elementData.font"
            [style.font-size.px]="elementData.fontSize"
            [style.color]="elementData.fontColor"
            [style.font-weight]="elementData.bold ? 'bold' : ''"
            [style.font-style]="elementData.italic ? 'italic' : ''"
            [style.text-decoration]="elementData.underline ? 'underline' : ''"
            [ngStyle]="{'border': selected ? '5px solid' : ''}">
        {{elementData.text}}
      </button>
    `
})
export class ButtonComponent extends ElementComponent implements OnInit {
  elementData!: ButtonElement;

  ngOnInit(): void {
    this.elementData = this.elementModel as unknown as ButtonElement;
  }
}
