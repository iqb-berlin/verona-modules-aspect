import {
  Component, OnInit
} from '@angular/core';
import { ElementComponent } from '../element.component';
import { ButtonElement, UnitUIElement } from '../../../model/unit';

@Component({
  selector: 'app-template-button',
  template: `
    <button mat-button cdkDrag (click)="select()"
            (cdkDragEnded)="drop($event)"
            [cdkDragFreeDragPosition]="{x: elementData.xPosition, y: elementData.yPosition}"
            cdkDragBoundary=".elementCanvas"
            [style.width.px]="elementData.width"
            [style.height.px]="elementData.height"
            [style.background-color]="elementData.backgroundColor">
      {{elementData.text}}
    </button>
    `
})
export class ButtonComponent extends ElementComponent implements OnInit {
  elementData!: ButtonElement;

  ngOnInit(): void {
    this.elementData = this.element as unknown as ButtonElement;
  }

  select(): void {
    this.elementSelected.emit(this as unknown as UnitUIElement);
  }
}
