import { Component, Input } from '@angular/core';
import { HotspotImageElement } from 'common/models/elements/input-elements/hotspot-image';
import { FormElementComponent } from '../../directives/form-element-component.directive';

@Component({
  selector: 'aspect-hotspot-image',
  template: `
    <div *ngIf="elementModel.src"
         [style.width.%]="100"
         [style.height.%]="100"
         class="image-container">
      <img [src]="elementModel.src | safeResourceUrl"
           [alt]="'imageNotFound' | translate"
           tabindex="0"
           (focusout)="elementFormControl.markAsTouched()">
      <div *ngFor="let item of elementModel.value; let index = index">
        <div *ngIf="item.shape === 'triangle'"
             class="triangle-container"
             [style.top.px]="item.top"
             [style.left.px]="item.left"
             [style.width.px]="item.width"
             [style.height.px]="item.height"
             [style.transform]="'rotate(' + item.rotation + 'deg)'">
          <div class="triangle-half">
            <div class="triangle-half-inner hotspot"
                 [style.transform]="'scale(2) rotate(' +
                 (((item.height + item.borderWidth) | mathAtan:(item.width/2 + item.borderWidth)) | mathDegrees) +
                 'deg)'"
                 [class.active-hotspot]="!item.readOnly"
                 [class.border-left]="item.borderWidth > 0"
                 [style.border-width.px]="(item.borderWidth + 0.5) / 2"
                 [style.border-color]="item.borderColor"
                 [style.background-color]="(parentForm && elementFormControl.value[index].value) ||
              (!parentForm && item.value) ?
              item.backgroundColor :
              'transparent'"
                 (click)="!item.readOnly && parentForm ? onHotspotClicked(index) : null">
            </div>
            <div *ngIf="item.borderWidth > 0"
                 class="triangle-half-bottom-border hotspot"
                 [style.left.px]="item.borderWidth - 1"
                 [style.border-width.px]="item.borderWidth"
                 [style.border-color]="item.borderColor"
                 [style.bottom.px]="item.borderWidth">
            </div>
          </div>
          <div class="triangle-half"
               [style.left.%]="50"
               [style.transform]="'scaleX(-1)'">
            <div class="triangle-half-inner hotspot"
                 [style.transform]="'scale(2) rotate(' +
                 (((item.height + item.borderWidth) | mathAtan:(item.width/2 + item.borderWidth)) | mathDegrees) +
                 'deg)'"
                 [class.active-hotspot]="!item.readOnly"
                 [class.border-left]="item.borderWidth > 0"
                 [style.border-width.px]="(item.borderWidth + 0.5) / 2"
                 [style.border-color]="item.borderColor"
                 [style.background-color]="(parentForm && elementFormControl.value[index].value) ||
              (!parentForm && item.value) ?
              item.backgroundColor :
              'transparent'"
                 (click)="!item.readOnly && parentForm ? onHotspotClicked(index) : null">
            </div>
            <div *ngIf="item.borderWidth > 0"
                 class="triangle-half-bottom-border hotspot"
                 [style.left.px]="item.borderWidth - 1"
                 [style.border-width.px]="item.borderWidth"
                 [style.border-color]="item.borderColor"
                 [style.bottom.px]="item.borderWidth">
            </div>
          </div>
        </div>
        <div *ngIf="item.shape !== 'triangle'"
             class="hotspot"
             [class.active-hotspot]="!item.readOnly"
             [class.circle]="item.shape === 'ellipse'"
             [class.border]="item.borderWidth > 0"
             [style.border-width.px]="item.borderWidth"
             [style.border-color]="item.borderColor"
             [style.background-color]="(parentForm && elementFormControl.value[index].value) ||
                                       (!parentForm && item.value) ?
                                       item.backgroundColor :
                                       'transparent'"
             [style.top.px]="item.top"
             [style.left.px]="item.left"
             [style.width.px]="item.width"
             [style.height.px]="item.height"
             [style.transform]="'rotate(' + item.rotation + 'deg)'"
             (click)="!item.readOnly && parentForm ? onHotspotClicked(index) : null">
        </div>
      </div>
      <mat-error *ngIf="elementFormControl.errors && elementFormControl.touched">
        {{elementFormControl.errors | errorTransform: elementModel}}
      </mat-error>
    </div>
  `,
  styles: [
    '.triangle-half {height: 100%; width: 50%; overflow: hidden; position: absolute; pointer-events: none}',
    '.triangle-container {overflow: hidden; position: absolute; pointer-events: none;}',
    '.triangle-half-inner {transform-origin: 0 100%; width: 100%; height: 100%;}',
    '.triangle-half-bottom-border {top: 0; height: 100%; width: 100%; border-bottom-style: solid}',
    '.border {border-style: solid}',
    '.border-left {border-left-style: solid}',
    '.circle {border-radius: 50%;}',
    '.hotspot {position: absolute; box-sizing: border-box;}',
    '.active-hotspot {cursor: pointer; pointer-events: all}',
    '.image-container {position: relative;}'
  ]
})
export class HotspotImageComponent extends FormElementComponent {
  @Input() elementModel!: HotspotImageElement;

  onHotspotClicked(index: number): void {
    const actualValue = this.elementFormControl.value;
    actualValue[index].value = !actualValue[index].value;
    this.elementFormControl.setValue(actualValue);
  }
}
