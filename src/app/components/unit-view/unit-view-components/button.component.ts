import {
  Component, OnInit
} from '@angular/core';
import { ElementComponent } from '../element.component';
import { ButtonElement } from '../../../model/unit';

@Component({
  selector: 'app-template-button',
  template: `
      <button mat-button cdkDrag (click)="select($event)"
            (cdkDragEnded)="drop($event)"
            [cdkDragFreeDragPosition]="{x: elementData.xPosition, y: elementData.yPosition}"
            cdkDragBoundary=".elementCanvas"
            [ngStyle]="style">
        {{elementData.text}}
      </button>
    `
})
export class ButtonComponent extends ElementComponent implements OnInit {
  elementData!: ButtonElement;

  ngOnInit(): void {
    this.elementData = this.elementModel as unknown as ButtonElement;
    this.updateStyle();
  }
}
