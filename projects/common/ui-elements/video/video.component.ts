import { Component, Input } from '@angular/core';
import { VideoElement } from './video-element';
import { MediaPlayerElementComponent } from '../../directives/media-player-element-component.directive';

@Component({
  selector: 'aspect-video',
  template: `
    <div [class]="elementModel.scale ? 'fit-video' : 'max-size-video'"
         [style.width.%]="100"
         [style.height.%]="100">
      <video #player
             (playing)="onMediaPlayStatusChanged.emit(this.elementModel.id)"
             (pause)="onMediaPlayStatusChanged.emit(null)"
             [style.width.%]="100"
             [src]="elementModel.src | safeResourceUrl">
      </video>
      <aspect-control-bar class="correct-position"
                          [player]="player"
                          [project]="project"
                          [active]="active"
                          [id]="elementModel.id"
                          [playerProperties]="elementModel.playerProps"
                          [dependencyDissolved]="dependencyDissolved"
                          (onMediaValidStatusChanged)="onMediaValidStatusChanged.emit($event)"
                          (elementValueChanged)="elementValueChanged.emit($event)">
      </aspect-control-bar>
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
