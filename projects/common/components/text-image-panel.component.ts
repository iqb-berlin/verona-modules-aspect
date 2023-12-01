import {
  Component, Input
} from '@angular/core';
import { DragNDropValueObject, TextImageLabel } from 'common/models/elements/label-interfaces';

@Component({
  selector: 'aspect-text-image-panel',
  template: `
    <div class="wrapper" [ngClass]="{'column': label.imgPosition === 'above',
                                     'column-reverse': label.imgPosition === 'below',
                                     'row': label.imgPosition === 'left',
                                     'row-reverse': label.imgPosition === 'right'}">
      <ng-container *ngIf="$any(label).audioSrc">
        <audio #player
               [src]="$any(label).audioSrc | safeResourceUrl">
        </audio>
<!--             [style.pointer-events]="'auto'"-->
<!--             (mousedown)="$event.stopPropagation()"-->
        <div class="audio-button"
             (click)="player.play()">
          <mat-icon>play_arrow</mat-icon>
        </div>
      </ng-container>
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
      justify-content: inherit;
    }
    .column {flex-direction: column;}
    .column-reverse {flex-direction: column-reverse;}
    .row {flex-direction: row;}
    .row-reverse {flex-direction: row-reverse;}
    .text {
      display: flex;
      align-items: center;
      justify-content: inherit;
      color: inherit;
      font-family: inherit;
      font-size: inherit;
      font-weight: inherit;
      font-style: inherit;
      text-decoration: inherit;
      background-color: inherit;
    }
    .audio-button {
      cursor: pointer;
      display: flex; flex-direction: row; align-items: center; justify-content: flex-start;
    }
    .audio-button:hover {color: #006064;}
  `]
})
export class TextImagePanelComponent {
  @Input() label!: TextImageLabel | DragNDropValueObject;
}
