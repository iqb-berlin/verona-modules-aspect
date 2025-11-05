import {
  AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild
} from '@angular/core';
import { MediaPlayerElementComponent } from 'common/directives/media-player-element-component.directive';
import { AudioElement } from 'common/models/elements/media-elements/audio';
import { VideoElement } from 'common/models/elements/media-elements/video';
import { UIElement } from 'common/models/elements/element';
import { ValueChangeElement } from 'common/interfaces';
import { StorableTimer } from 'player/src/app/classes/storable-timer';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { StateVariableStateService } from 'player/src/app/services/state-variable-state.service';
import { MediaPlayerService } from '../../../services/media-player.service';
import { UnitStateService } from '../../../services/unit-state.service';
import { ElementGroupDirective } from '../../../directives/element-group.directive';
import { ElementModelElementCodeMappingService } from '../../../services/element-model-element-code-mapping.service';

@Component({
  selector: 'aspect-media-player-group-element',
  templateUrl: './media-player-group-element.component.html',
  styleUrls: ['./media-player-group-element.component.scss'],
  standalone: false
})
export class MediaPlayerGroupElementComponent extends ElementGroupDirective
  implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('elementComponent') elementComponent!: MediaPlayerElementComponent;
  @Input() elementModel!: UIElement;
  @Input() pageIndex!: number;

  private ngUnsubscribe: Subject<void> = new Subject();
  initialValue: number = 0;
  timerStateVariable: StorableTimer | null = null;

  AudioElement!: AudioElement;
  VideoElement!: VideoElement;

  constructor(
    private stateVariableStateService: StateVariableStateService,
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
    if (this.elementModel.player?.showHint) {
      this.initHintDelay();
    }
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

  private get timerStateVariableId(): string {
    return `${this.elementModel.id}-${this.elementModel.player?.hintDelay}-timer}`;
  }

  private destroyTimerStateVariable(): void {
    this.timerStateVariable?.stop();
    this.timerStateVariable = null;
  }

  private initHintDelay(): void {
    this.timerStateVariable = new StorableTimer(
      this.timerStateVariableId,
      this.stateVariableStateService
        .getElementCodeById(this.timerStateVariableId)?.value as number || 0,
      this.elementModel.player?.hintDelay as number
    );
    this.timerStateVariable.timerStateValueChanged
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((value: ValueChangeElement) => {
        this.stateVariableStateService.changeElementCodeValue({
          id: value.id,
          value: value.value as number
        });
      });
    this.timerStateVariable.timerStateEnded
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.destroyTimerStateVariable();
      });
    this.stateVariableStateService.registerElementCode(
      this.timerStateVariable.id,
      this.timerStateVariable.id,
      this.timerStateVariable.value);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
