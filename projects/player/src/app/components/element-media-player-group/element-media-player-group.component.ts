import { Component, Input, OnInit } from '@angular/core';
import { AudioElement, VideoElement, UIElement } from '../../../../../common/interfaces/elements';
import { MediaPlayerService } from '../../services/media-player.service';

@Component({
  selector: 'aspect-element-media-player-group',
  templateUrl: './element-media-player-group.component.html',
  styleUrls: ['./element-media-player-group.component.scss']
})
export class ElementMediaPlayerGroupComponent implements OnInit {
  @Input() elementModel!: UIElement;
  AudioElement!: AudioElement;
  VideoElement!: VideoElement;

  constructor(public mediaPlayerService: MediaPlayerService) { }

  ngOnInit(): void {
  }

}
