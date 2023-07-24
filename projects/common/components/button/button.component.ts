import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { ButtonElement, ButtonEvent } from 'common/models/elements/button/button';
import { ElementComponent } from '../../directives/element-component.directive';

@Component({
  selector: 'aspect-button',
  template: `
    <a *ngIf="!elementModel.imageSrc && elementModel.asLink"
       href="{{elementModel.action+'-'+elementModel.actionParam}}"
       [style.background-color]="elementModel.styling.backgroundColor"
       [style.color]="elementModel.styling.fontColor"
       [style.font-family]="elementModel.styling.font"
       [style.font-size.px]="elementModel.styling.fontSize"
       [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
       [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
       [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''"
       #tooltip="matTooltip"
       [matTooltip]="elementModel.tooltipText"
       [matTooltipPosition]="elementModel.tooltipPosition"
       [matTooltipHideDelay]="tooltipDelay"
       (pointerdown)="tooltipDelay = 3000; tooltip.show()"
       (mouseleave)="tooltipDelay = 0; tooltip.hide();"
       (click)="$event.preventDefault();
                elementModel.action && elementModel.actionParam !== null ?
                buttonActionEvent.emit($any({ action: elementModel.action, param: elementModel.actionParam})) :
                false">
      {{elementModel.label}}
    </a>

    <button *ngIf="!elementModel.imageSrc && !elementModel.asLink" mat-button
            type='button'
            class="full-size"
            [style.background-color]="elementModel.styling.backgroundColor"
            [style.color]="elementModel.styling.fontColor"
            [style.font-family]="elementModel.styling.font"
            [style.font-size]="elementModel.subscriptLabel || elementModel.superscriptLabel ?
                                'smaller' :
                                elementModel.styling.fontSize + 'px'"
            [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
            [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''"
            [style.border-width.px]="elementModel.styling.borderWidth"
            [style.border-style]="elementModel.styling.borderStyle"
            [style.border-color]="elementModel.styling.borderColor"
            [style.border-radius.px]="elementModel.styling.borderRadius"
            [style.vertical-align]="elementModel.subscriptLabel ?
                                      'sub' :
                                      elementModel.superscriptLabel ? 'super' : 'baseline'"
            [style.font-weight]="elementModel.styling.bold ? 'bold' :
                                  elementModel.subscriptLabel || elementModel.superscriptLabel ?
                                    400 : ''"
            #tooltip="matTooltip"
            [matTooltip]="elementModel.tooltipText"
            [matTooltipPosition]="elementModel.tooltipPosition"
            [matTooltipHideDelay]="tooltipDelay"
            (pointerdown)="tooltipDelay = 3000; tooltip.show()"
            (mouseleave)="tooltipDelay = 0; tooltip.hide();"
            (click)="elementModel.action && elementModel.actionParam !== null ?
                     buttonActionEvent.emit($any({ action: elementModel.action, param: elementModel.actionParam })) :
                     false">
      {{elementModel.label}}
    </button>

    <input *ngIf="elementModel.imageSrc"
           type="image"
           class="full-size image"
           [src]="elementModel.imageSrc | safeResourceUrl"
           [alt]="'imageNotFound' | translate"
           #tooltip="matTooltip"
           [matTooltip]="elementModel.tooltipText"
           [matTooltipPosition]="elementModel.tooltipPosition"
           [matTooltipHideDelay]="tooltipDelay"
           (pointerdown)="tooltipDelay = 3000; tooltip.show()"
           (mouseleave)="tooltipDelay = 0; tooltip.hide();"
           (click)="elementModel.action !== null && elementModel.actionParam !== null?
                    buttonActionEvent.emit($any({ action: elementModel.action, param: elementModel.actionParam })) :
                    false">
  `,
  styles: [
    '.full-size {width: 100%; height: 100%;}',
    '.image {object-fit: contain;}',
    '.mdc-button {min-width: unset;}'
  ]
})
export class ButtonComponent extends ElementComponent {
  tooltipDelay: number = 3000;

  @Input() elementModel!: ButtonElement;
  @Output() buttonActionEvent = new EventEmitter<ButtonEvent>();
}
