import {
  Component, Input
} from '@angular/core';
import { DragNDropValueObject, TextImageLabel } from 'common/interfaces';
import { AudioPlayerService } from 'common/services/audio-player.service';

@Component({
  selector: 'aspect-text-image-panel',
  templateUrl: './text-image-panel.component.html',
  styleUrls: ['./text-image-panel.component.scss'],
  standalone: false
})
export class TextImagePanelComponent {
  @Input() label!: TextImageLabel | DragNDropValueObject;
  @Input() hideContent: boolean = false;

  constructor(public audioPlayerService: AudioPlayerService) {}
}
