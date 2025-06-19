import {
  Component, Input, OnInit, ViewChild, ViewContainerRef
} from '@angular/core';
import { UIElement } from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { PrintMode } from 'player/modules/verona/models/verona';
import { CompoundElementComponent } from 'common/directives/compound-element.directive';

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
  elementComponents: ElementComponent[] = [];

  ngOnInit(): void {
    if (this.elementModel) {
      this.printElementComponent =
        this.elementComponentContainer.createComponent(this.elementModel.getElementComponent()).instance;
      this.printElementComponent.elementModel = this.elementModel;

      if (this.printMode === 'on-with-ids') {
        if (this.printElementComponent instanceof CompoundElementComponent) {
          (this.printElementComponent as CompoundElementComponent).childrenAdded
            .subscribe((children: ElementComponent[]) => {
              setTimeout(() => {
                this.elementComponents = [this.printElementComponent, ...children];
              });
              children.forEach(child => {
                child.domElement.setAttribute('data-element-id', child.elementModel.id);
                child.domElement.setAttribute('data-element-alias', child.elementModel.alias);
              });
            });
        } else {
          this.elementComponents = [this.printElementComponent];
        }
      }
    }
  }
}
