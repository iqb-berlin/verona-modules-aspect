import { Component, Input } from '@angular/core';
import { WidgetPeriodicTableElement } from 'common/models/elements/widgets/widget-periodic-table';
import { ElementComponent } from '../../directives/element-component.directive';

@Component({
  selector: 'aspect-widget-periodic-table',
  template: `
    <div [style.width]="'calc(100% - ' + (elementModel.styling.borderWidth * 2) + 'px)'"
         [style.height]="'calc(100% - ' + (elementModel.styling.borderWidth * 2) + 'px)'"
         [style.border-width.px]="elementModel.styling.borderWidth"
         [style.border-color]="elementModel.styling.borderColor"
         [style.border-radius.px]="elementModel.styling.borderRadius"
         [style.background-color]="elementModel.styling.backgroundColor"
         [style.border-top-style]="elementModel.hasBorderTop ? elementModel.styling.borderStyle : 'none'"
         [style.border-bottom-style]="elementModel.hasBorderBottom ? elementModel.styling.borderStyle : 'none'"
         [style.border-left-style]="elementModel.hasBorderLeft ? elementModel.styling.borderStyle : 'none'"
         [style.border-right-style]="elementModel.hasBorderRight ? elementModel.styling.borderStyle : 'none'">
    </div>
  `,
  standalone: false
})
export class WidgetPeriodicTableComponent extends ElementComponent {
  @Input() elementModel!: WidgetPeriodicTableElement;
}
