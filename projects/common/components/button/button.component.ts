import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { ButtonElement } from 'common/models/elements/button/button';
import { ButtonEvent } from 'common/models/elements/element';
import { ElementComponent } from '../../directives/element-component.directive';

@Component({
  selector: 'aspect-button',
  template: `
    <div *ngIf="!elementModel.imageSrc && elementModel.asLink"
         [style.width.%]="100"
         [style.height.%]="100">
      <a href="{{elementModel.action+'-'+elementModel.actionParam}}"
         [style.background-color]="elementModel.styling.backgroundColor"
         [style.color]="elementModel.styling.fontColor"
         [style.font-family]="elementModel.styling.font"
         [style.font-size.px]="elementModel.styling.fontSize"
         [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
         [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
         [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''"
         [style.border-radius.px]="elementModel.styling.borderRadius"
         (click)="$event.preventDefault(); elementModel.action && elementModel.actionParam !== null ?
                                             navigateTo.emit({
                                                action: elementModel.action,
                                                param: elementModel.actionParam
                                             }) : false">
        <!--preventDefault to prevent form submission-->
        {{elementModel.label}}
      </a>
    </div>
    <button *ngIf="!elementModel.imageSrc && !elementModel.asLink" mat-button
            type='button'
            [style.width.%]="100"
            [style.height.%]="100"
            [style.background-color]="elementModel.styling.backgroundColor"
            [style.color]="elementModel.styling.fontColor"
            [style.font-family]="elementModel.styling.font"
            [style.font-size.px]="elementModel.styling.fontSize"
            [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
            [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
            [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''"
            [style.border-radius.px]="elementModel.styling.borderRadius"
            (click)="elementModel.action && elementModel.actionParam !== null ?
               navigateTo.emit({
                  action: elementModel.action,
                  param: elementModel.actionParam
               }) :
               false">
      {{elementModel.label}}
    </button>
    <input
        *ngIf="elementModel.imageSrc" type="image"
        [src]="elementModel.imageSrc | safeResourceUrl"
        [class]="elementModel.position?.dynamicPositioning &&
                 !elementModel.position?.fixedSize ? 'dynamic-image' : 'static-image'"
        [alt]="'imageNotFound' | translate"
        (click)="elementModel.action && elementModel.actionParam !== null?
           navigateTo.emit({
              action: elementModel.action,
              param: elementModel.actionParam
           }) :
           false">
  `,
  styles: [
    '.dynamic-image {width: 100%; height: fit-content;}',
    '.static-image {max-width: 100%; max-height: 100%; display: grid;}', // grid: to prevent scrollbars
    '.fill-container {width: 100%; height: 100%;}'
  ]
})
export class ButtonComponent extends ElementComponent {
  @Input() elementModel!: ButtonElement;
  @Output() navigateTo = new EventEmitter<ButtonEvent>();
}
