import {
  Component, Input
} from '@angular/core';
import { TextImageLabel } from 'common/models/elements/label-interfaces';

@Component({
  selector: 'aspect-text-image-panel',
  template: `
    <div class="wrapper" [ngClass]="{'column': label.imgPosition === 'above',
                                   'column-reverse': label.imgPosition === 'below',
                                   'row': label.imgPosition === 'left',
                                   'row-reverse': label.imgPosition === 'right'}">
      <img *ngIf="label.imgSrc"
           [style.object-fit]="'scale-down'"
           [style.max-width.%]="100"
           [src]="label.imgSrc | safeResourceUrl" alt="Image Placeholder">
      <div class="text" [innerHTML]="label.text | safeResourceHTML"></div>
    </div>
  `,
  styles: [`
    :host {align-self: center;}
    .wrapper {
      display: flex;
    }
    .column {flex-direction: column;}
    .column-reverse {flex-direction: column-reverse;}
    .row {flex-direction: row;}
    .row-reverse {flex-direction: row-reverse;}
    .text {
      display: flex;
      align-items: center;
      justify-content: center;
      color: inherit;
      font-family: inherit;
      font-size: inherit;
      font-weight: inherit;
      font-style: inherit;
      text-decoration: inherit;
      background-color: inherit;
    }
  `]
})
export class TextImagePanelComponent {
  @Input() label!: TextImageLabel;
}
