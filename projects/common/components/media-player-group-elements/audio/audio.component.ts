import {
  Component, Input, Output, EventEmitter
} from '@angular/core';
import { AudioElement } from 'common/models/elements/media-player-group-elements/audio';
import { MediaPlayerElementComponent } from 'common/directives/media-player-element-component.directive';

@Component({
  selector: 'aspect-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.scss'],
  standalone: false
})
export class AudioComponent extends MediaPlayerElementComponent {
  @Input() elementModel!: AudioElement;
  @Input() hintDelay!: number;
  @Output() hintDelayInitialized = new EventEmitter<string>();
}
