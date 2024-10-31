import {
  AfterViewInit, Component, Input, OnInit, ViewChild
} from '@angular/core';
import { MediaPlayerElementComponent } from 'common/directives/media-player-element-component.directive';
import { AudioElement } from 'common/models/elements/media-elements/audio';
import { VideoElement } from 'common/models/elements/media-elements/video';
import { UIElement } from 'common/models/elements/element';
import { ValueChangeElement } from 'common/interfaces';
import { MediaPlayerService } from '../../../services/media-player.service';
import { UnitStateService } from '../../../services/unit-state.service';
import { ElementGroupDirective } from '../../../directives/element-group.directive';
import { ElementModelElementCodeMappingService } from '../../../services/element-model-element-code-mapping.service';

@Component({
  selector: 'aspect-media-player-group-element',
  templateUrl: './media-player-group-element.component.html',
  styleUrls: ['./media-player-group-element.component.scss']
})
export class MediaPlayerGroupElementComponent extends ElementGroupDirective implements OnInit, AfterViewInit {
  @ViewChild('elementComponent') elementComponent!: MediaPlayerElementComponent;
  @Input() elementModel!: UIElement;
  @Input() pageIndex!: number;

  initialValue: number = 0;

  AudioElement!: AudioElement;
  VideoElement!: VideoElement;

  constructor(
    public mediaPlayerService: MediaPlayerService,
    public unitStateService: UnitStateService,
    private elementModelElementCodeMappingService: ElementModelElementCodeMappingService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initialValue = this.elementModelElementCodeMappingService.mapToElementModelValue(
      this.unitStateService.getElementCodeById(this.elementModel.id)?.value, this.elementModel) as number;
    this.mediaPlayerService.registerMediaElement(
      this.elementModel.id,
      this.elementModel.player?.minRuns as number === 0
    );
  }

  ngAfterViewInit(): void {
    this.registerAtUnitStateService(
      this.elementModel.id,
      this.elementModel.alias,
      ElementModelElementCodeMappingService.mapToElementCodeValue(this.initialValue, this.elementModel.type),
      this.elementComponent,
      this.pageIndex);
  }

  changeElementCodeValue(value: ValueChangeElement): void {
    this.unitStateService.changeElementCodeValue({
      id: value.id,
      value: ElementModelElementCodeMappingService
        .mapToElementCodeValue(value.value, this.elementModel.type)
    });
  }
}
