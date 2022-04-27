import {
  AfterViewInit, Component, Input, OnInit, ViewChild
} from '@angular/core';
import {
  AudioElement, VideoElement, UIElement
} from 'common/interfaces/elements';
import { MediaPlayerService } from '../../services/media-player.service';
import { UnitStateService } from '../../services/unit-state.service';
import { MediaPlayerElementComponent } from 'common/directives/media-player-element-component.directive';
import { ElementGroupDirective } from '../../directives/element-group.directive';
import { UnitStateElementValueMappingService } from '../../services/unit-state-element-value-mapping.service';

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
    public unitStateService: UnitStateService,
    private unitStateElementValueMappingService: UnitStateElementValueMappingService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initialValue = this.unitStateElementValueMappingService.mapToElementValue(
      this.unitStateService.getUnitStateElement(this.elementModel.id)?.value, this.elementModel) as number;
    this.mediaPlayerService.registerMediaElement(
      this.elementModel.id,
      this.elementModel.player?.minRuns as number === 0
    );
  }

  ngAfterViewInit(): void {
    this.registerAtUnitStateService(this.elementModel.id,
      this.unitStateElementValueMappingService.mapToUnitState(this.initialValue, this.elementModel.type),
      this.elementComponent,
      this.pageIndex);
  }
}
