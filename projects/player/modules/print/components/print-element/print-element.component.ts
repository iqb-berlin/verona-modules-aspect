import { Component, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { UIElement } from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { PrintMode } from 'player/modules/verona/models/verona';

@Component({
  selector: 'aspect-print-element',
  templateUrl: './print-element.component.html',
  styleUrls: ['./print-element.component.scss']
})
export class PrintElementComponent implements OnInit {
  @Input() printMode!: PrintMode;
  @Input() elementModel!: UIElement;
  @Input() pageIndex!: number;

  @ViewChild('elementComponentContainer',
             { read: ViewContainerRef, static: true }) private elementComponentContainer!: ViewContainerRef;

  printElementComponent!: ElementComponent;

  children: UIElement[] = [];
  tooltipText: string = '';

  ngOnInit(): void {
    if (this.elementModel) {
      this.printElementComponent =
        this.elementComponentContainer.createComponent(this.elementModel.getElementComponent()).instance;
      this.printElementComponent.elementModel = this.elementModel;
      this.children = this.elementModel.getChildElements();
      this.tooltipText = this.getTooltipText();
    }
  }

  getTooltipText(): string {
    return [
      this.elementModel.alias,
      ...this.children.map(child => child.alias)
    ].join('\n');
  }
}
