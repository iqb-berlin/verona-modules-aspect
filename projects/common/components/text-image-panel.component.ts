import {
  Component, Input
} from '@angular/core';
import { BasicStyles, TextImageLabel } from 'common/models/elements/element';

@Component({
  selector: 'aspect-text-image-panel',
  template: `
    <div class="panel" [ngClass]="{'column': label.imgPosition === 'above',
                                   'column-reverse': label.imgPosition === 'below',
                                   'row': label.imgPosition === 'left',
                                   'row-reverse': label.imgPosition === 'right'}">
      <img *ngIf="label.imgSrc"
           [style.object-fit]="'scale-down'"
           [style.max-width.%]="100"
           [src]="label.imgSrc | safeResourceUrl" alt="Image Placeholder">
      <div class="text"
           [innerHTML]="label.text | safeResourceHTML"
           [style.background-color]="styling.backgroundColor"
           [style.color]="styling.fontColor"
           [style.font-family]="styling.font"
           [style.font-size.px]="styling.fontSize"
           [style.font-weight]="styling.bold ? 'bold' : ''"
           [style.font-style]="styling.italic ? 'italic' : ''"
           [style.text-decoration]="styling.underline ? 'underline' : ''"></div>
    </div>
  `,
  styles: [`
    .panel {display: flex;}
    .column {flex-direction: column;}
    .column-reverse {flex-direction: column-reverse;}
    .row {flex-direction: row;}
    .row-reverse {flex-direction: row-reverse;}
    .text {display: flex; align-items: center;}
  `]
})
export class TextImagePanelComponent {
  @Input() label!: TextImageLabel;
  @Input() styling: BasicStyles = {
    backgroundColor: '',
    bold: false,
    font: '',
    fontColor: '',
    fontSize: 20,
    italic: false,
    underline: false
  };
}
