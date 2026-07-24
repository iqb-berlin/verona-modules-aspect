import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { VideoElement } from 'common/models/elements/media-elements/video';
import { MediaPlayerElementComponent } from 'common/directives/media-player-element-component.directive';

@Component({
  selector: 'aspect-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss'],
  standalone: false
})
export class VideoComponent extends MediaPlayerElementComponent {
  @Input() elementModel!: VideoElement;
  @Input() hintDelay!: number;
  @Output() hintDelayInitialized = new EventEmitter<string>();
  @Output() videoClicked = new EventEmitter<MouseEvent>();
}
