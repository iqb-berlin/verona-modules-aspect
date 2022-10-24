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
        <div class="hotspot"
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
    '.circle {border-radius: 50%;}',
    '.border {border-color: #000000; border-style: solid}',
    '.hotspot {position: absolute; box-sizing: border-box;}',
    '.active-hotspot {cursor: pointer;}',
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
