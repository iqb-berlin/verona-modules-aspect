import { Component, Input } from '@angular/core';
import { MediaPlayerElementComponent } from '../../directives/media-player-element-component.directive';
import { VideoElement } from 'common/ui-elements/video/video';

@Component({
  selector: 'aspect-video',
  template: `
    <div [class]="elementModel.scale ? 'fit-video' : 'max-size-video'"
         [style.width.%]="100"
         [style.height.%]="100">
      <aspect-media-player-control-bar class="correct-position" *ngIf="elementModel.src"
                          [player]="player"
                          [project]="project"
                          [active]="active"
                          [id]="elementModel.id"
                          [savedPlaybackTime]="savedPlaybackTime"
                          [playerProperties]="elementModel.player"
                          [dependencyDissolved]="dependencyDissolved"
                          (onMediaValidStatusChanged)="onMediaValidStatusChanged.emit($event)"
                          (elementValueChanged)="elementValueChanged.emit($event)">
        <video #player
               (playing)="onMediaPlayStatusChanged.emit(this.elementModel.id)"
               (pause)="onMediaPlayStatusChanged.emit(null)"
               [style.width.%]="100"
               [src]="elementModel.src | safeResourceUrl">
        </video>
      </aspect-media-player-control-bar>
    </div>
  `,
  styles: [
    '.correct-position{ display: block; margin-top: -4px; }',
    '.max-size-video{ width: fit-content; max-height: fit-content }',
    '.fit-video{ width: 100%; height: 100%; object-fit: contain}'
  ]
})
export class VideoComponent extends MediaPlayerElementComponent {
  @Input() elementModel!: VideoElement;
}
