import {
  AfterViewInit, Component, Input, OnInit, ViewChild
} from '@angular/core';
import {
  AudioElement, VideoElement, UIElement
} from '../../../../../common/interfaces/elements';
import { MediaPlayerService } from '../../services/media-player.service';
import { UnitStateService } from '../../services/unit-state.service';
import { MediaPlayerElementComponent } from '../../../../../common/directives/media-player-element-component.directive';
import { ElementGroupDirective } from '../../directives/element-group.directive';

@Component({
  selector: 'aspect-element-media-player-group',
  templateUrl: './element-media-player-group.component.html',
  styleUrls: ['./element-media-player-group.component.scss']
})
export class ElementMediaPlayerGroupComponent extends ElementGroupDirective implements OnInit, AfterViewInit {
  @ViewChild('elementComponent') elementComponent!: MediaPlayerElementComponent;
  @Input() elementModel!: UIElement;
  @Input() pageIndex!: number;

  initialValue!: number;

  AudioElement!: AudioElement;
  VideoElement!: VideoElement;

  constructor(
    public mediaPlayerService: MediaPlayerService,
    public unitStateService: UnitStateService
  ) {
    super();
  }

  ngOnInit(): void {
    const unitStateValue = this.unitStateService.getUnitStateElement(this.elementModel.id)?.value;
    this.initialValue = unitStateValue !== undefined ?
      unitStateValue as number : (this.elementModel as AudioElement).playerProps.playbackTime;

    this.mediaPlayerService.registerMediaElement(
      this.elementModel.id,
      this.elementModel.playerProps?.minRuns as number === 0
    );
  }

  ngAfterViewInit(): void {
    const initialValue = this.elementModel.type === 'audio' ?
      (this.elementModel as AudioElement).playerProps.playbackTime :
      (this.elementModel as VideoElement).playerProps.playbackTime;
    this.registerAtUnitStateService(this.elementModel.id, initialValue, this.elementComponent, this.pageIndex);
  }
}
