/* eslint-disable max-classes-per-file */
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import {
  ComponentFixture, fakeAsync, TestBed, tick
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { ElementComponent } from 'common/directives/element-component.directive';
import { UIElement } from 'common/models/elements/element';
import { AudioElement } from 'common/models/elements/media-player-group-elements/audio';
import { VideoElement } from 'common/models/elements/media-player-group-elements/video';
import { PropertyGroupGenerators } from 'common/models/elements/property-group-interfaces';
import { ValueChangeElement } from 'common/models/input-element-interfaces';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { MediaPlayerService } from 'player/src/app/services/media-player.service';
import { StateVariableStateService } from 'player/src/app/services/state-variable-state.service';
import { UnitStateService } from 'player/src/app/services/unit-state.service';
import { CastPipe } from 'player/src/app/pipes/cast.pipe';
import { MediaPlayerGroupElementComponent } from './media-player-group-element.component';

@Component({
  selector: 'aspect-audio',
  template: '',
  standalone: false
})
class AudioStubComponent extends ElementComponent {
  @Input() elementModel!: AudioElement;
  @Input() hintDelay!: number;
  @Input() savedPlaybackTime!: number;
  @Input() actualPlayingId!: Subject<string | null>;
  @Input() mediaStatusChanged!: Subject<string>;
  @Output() elementValueChanged = new EventEmitter<ValueChangeElement>();
  @Output() mediaPlayStatusChanged = new EventEmitter<string | null>();
  @Output() mediaValidStatusChanged = new EventEmitter<string>();
  @Output() hintDelayInitialized = new EventEmitter<void>();
}

@Component({
  selector: 'aspect-video',
  template: '',
  standalone: false
})
class VideoStubComponent extends ElementComponent {
  @Input() elementModel!: VideoElement;
  @Input() hintDelay!: number;
  @Input() savedPlaybackTime!: number;
  @Input() actualPlayingId!: Subject<string | null>;
  @Input() mediaStatusChanged!: Subject<string>;
  @Output() elementValueChanged = new EventEmitter<ValueChangeElement>();
  @Output() mediaPlayStatusChanged = new EventEmitter<string | null>();
  @Output() mediaValidStatusChanged = new EventEmitter<string>();
  @Output() hintDelayInitialized = new EventEmitter<void>();
}

describe('MediaPlayerGroupElementComponent', () => {
  let component: MediaPlayerGroupElementComponent;
  let fixture: ComponentFixture<MediaPlayerGroupElementComponent>;
  let unitStateService: SpyObj<UnitStateService>;
  let stateVariableStateService: SpyObj<StateVariableStateService>;
  let mediaPlayerService: SpyObj<MediaPlayerService> & {
    actualPlayingId: Subject<string | null>; mediaStatusChanged: Subject<string>;
  };

  const createAudio = (player: Partial<{ minRuns: number, showHint: boolean, hintDelay: number }> = {}):
  AudioElement => {
    const element = new AudioElement({ id: 'audio_1', alias: 'audio_1' });
    element.player = {
      ...PropertyGroupGenerators.generatePlayerProps({}),
      ...player
    };
    return element;
  };

  const initComponent = (elementModel: UIElement): void => {
    fixture = TestBed.createComponent(MediaPlayerGroupElementComponent);
    component = fixture.componentInstance;
    component.elementModel = elementModel;
    component.pageIndex = 1;
    fixture.detectChanges();
  };

  const audioStub = (): AudioStubComponent => fixture.debugElement
    .query(By.directive(AudioStubComponent)).componentInstance as AudioStubComponent;

  beforeEach(async () => {
    unitStateService = createSpyObj<UnitStateService>([
      'getElementCodeById', 'changeElementCodeValue', 'registerElementCode'
    ]);
    stateVariableStateService = createSpyObj<StateVariableStateService>([
      'getElementCodeById', 'registerElementCode', 'changeElementCodeValue'
    ]);
    mediaPlayerService = Object.assign(
      createSpyObj<MediaPlayerService>(['registerMediaElement', 'setActualPlayingId', 'setValidStatusChanged']),
      { actualPlayingId: new Subject<string | null>(), mediaStatusChanged: new Subject<string>() }
    );

    await TestBed.configureTestingModule({
      declarations: [
        MediaPlayerGroupElementComponent,
        AudioStubComponent,
        VideoStubComponent,
        CastPipe
      ],
      providers: [
        { provide: UnitStateService, useValue: unitStateService },
        { provide: StateVariableStateService, useValue: stateVariableStateService },
        { provide: MediaPlayerService, useValue: mediaPlayerService }
      ]
    })
      .compileComponents();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('should create', () => {
    initComponent(createAudio());

    expect(component).toBeTruthy();
  });

  it('should show an audio player for an audio element', () => {
    initComponent(createAudio());

    expect(fixture.debugElement.query(By.directive(AudioStubComponent))).toBeTruthy();
    expect(fixture.debugElement.query(By.directive(VideoStubComponent))).toBeNull();
  });

  it('should show a video player for a video element', () => {
    initComponent(new VideoElement({ id: 'video_1', alias: 'video_1' }));

    expect(fixture.debugElement.query(By.directive(VideoStubComponent))).toBeTruthy();
    expect(fixture.debugElement.query(By.directive(AudioStubComponent))).toBeNull();
  });

  it('should register the media element as optional when it needs no run', () => {
    initComponent(createAudio({ minRuns: 0 }));

    expect(mediaPlayerService.registerMediaElement).toHaveBeenCalledWith('audio_1', true);
  });

  it('should register the media element as mandatory when it needs a run', () => {
    initComponent(createAudio({ minRuns: 1 }));

    expect(mediaPlayerService.registerMediaElement).toHaveBeenCalledWith('audio_1', false);
  });

  it('should continue at the stored playback time', () => {
    unitStateService.getElementCodeById.mockReturnValue({ id: 'audio_1', alias: 'audio_1', value: 12 });

    initComponent(createAudio());

    expect(component.initialValue).toBe(12);
    expect(audioStub().savedPlaybackTime).toBe(12);
  });

  it('should register the element with its playback time at the unit state service', () => {
    unitStateService.getElementCodeById.mockReturnValue({ id: 'audio_1', alias: 'audio_1', value: 12 });
    const elementModel = createAudio();
    elementModel.isRelevantForPresentationComplete = true;

    initComponent(elementModel);

    expect(unitStateService.registerElementCode)
      .toHaveBeenCalledWith('audio_1', 'audio_1', 12, component.elementComponent.domElement, 1);
  });

  it('should report a changed playback time to the unit state service', () => {
    initComponent(createAudio());

    audioStub().elementValueChanged.emit({ id: 'audio_1', value: 20 });

    expect(unitStateService.changeElementCodeValue).toHaveBeenCalledWith({ id: 'audio_1', value: 20 });
  });

  it('should report the playing state to the media player service', () => {
    initComponent(createAudio());

    audioStub().mediaPlayStatusChanged.emit('audio_1');
    audioStub().mediaValidStatusChanged.emit('audio_1');

    expect(mediaPlayerService.setActualPlayingId).toHaveBeenCalledWith('audio_1');
    expect(mediaPlayerService.setValidStatusChanged).toHaveBeenCalledWith('audio_1');
  });

  it('should not prepare a hint delay without a hint', () => {
    initComponent(createAudio({ showHint: false }));

    expect(component.timerManager).toBeUndefined();
    expect(audioStub().hintDelay).toBe(0);
  });

  it('should prepare the hint delay as state variable', () => {
    stateVariableStateService.getElementCodeById.mockReturnValue(undefined);

    initComponent(createAudio({ showHint: true, hintDelay: 5000 }));

    expect(component.timerManager.timerStateVariable?.duration).toBe(5000);
    expect(stateVariableStateService.registerElementCode)
      .toHaveBeenCalledWith('audio_1-5000-timer}', 'audio_1-5000-timer}', 0);
  });

  it('should start the hint delay when the player is ready', fakeAsync(() => {
    initComponent(createAudio({ showHint: true, hintDelay: 5000 }));

    audioStub().hintDelayInitialized.emit();
    tick(1000);

    expect(component.timerManager.timerStateVariable?.value).toBe(1000);
    expect(stateVariableStateService.changeElementCodeValue)
      .toHaveBeenCalledWith({ id: 'audio_1-5000-timer}', value: 1000 });
    component.ngOnDestroy();
  }));

  it('should stop the hint delay on destruction', fakeAsync(() => {
    initComponent(createAudio({ showHint: true, hintDelay: 5000 }));
    component.onHintDelayInitialized();
    tick(1000);

    component.ngOnDestroy();
    tick(2000);

    expect(component.timerManager.timerStateVariable).toBeNull();
  }));
});
