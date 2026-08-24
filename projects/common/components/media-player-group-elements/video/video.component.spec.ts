// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { VideoElement, VideoProperties } from 'common/models/elements/media-player-group-elements/video';
import { PlayerProperties, PropertyGroupGenerators } from 'common/models/elements/property-group-interfaces';
import { ValueChangeElement } from 'common/models/input-element-interfaces';
import { VideoComponent } from './video.component';

@Component({
  selector: 'aspect-media-player-control-bar',
  template: '<ng-content></ng-content>',
  standalone: false
})
class MockMediaPlayerControlBarComponent {
  @Input() player!: HTMLVideoElement | HTMLAudioElement;
  @Input() type!: 'video' | 'audio';
  @Input() videoClicked!: EventEmitter<MouseEvent>;
  @Input() isLoaded!: BehaviorSubject<boolean>;
  @Input() mediaSrc!: string;
  @Input() project!: 'player' | 'editor';
  @Input() id!: string;
  @Input() savedPlaybackTime!: number;
  @Input() playerProperties!: PlayerProperties;
  @Input() hintDelay!: number;
  @Input() active!: boolean;
  @Input() dependencyDissolved!: boolean;
  @Input() backgroundColor!: string;
  @Output() mediaPlayStatusChanged = new EventEmitter<string | null>();
  @Output() mediaValidStatusChanged = new EventEmitter<string>();
  @Output() elementValueChanged = new EventEmitter<ValueChangeElement>();
  @Output() hintDelayInitialized = new EventEmitter<string>();
  @Output() mediaDurationNotAvailable = new EventEmitter<void>();
}

@Component({
  selector: 'aspect-spinner',
  template: '',
  standalone: false
})
class MockSpinnerComponent {
  @Input() isLoaded!: BehaviorSubject<boolean>;
  @Output() timeOut = new EventEmitter<number>();
}

describe('VideoComponent', () => {
  let component: VideoComponent;
  let fixture: ComponentFixture<VideoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        VideoComponent,
        MockMediaPlayerControlBarComponent,
        MockSpinnerComponent
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoComponent);
    component = fixture.componentInstance;
    component.elementModel = new VideoElement({
      type: 'video',
      id: 'test-id',
      alias: 'test-alias',
      src: '',
      fileName: 'test.mp4',
      scale: false,
      player: PropertyGroupGenerators.generatePlayerProps(),
      styling: { backgroundColor: '#f1f1f1' }
    } as Partial<VideoProperties>);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should not render the control bar when src is empty', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('aspect-media-player-control-bar')).toBeNull();
  });

  it('should render the video element when src is set', () => {
    component.elementModel.src = 'test.mp4';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('aspect-media-player-control-bar')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('video')).not.toBeNull();
  });

  it('should apply the scale class', () => {
    component.elementModel.scale = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.fit-video')).not.toBeNull();
    component.elementModel.scale = false;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.max-size-video')).not.toBeNull();
  });

  it('should emit videoClicked when the video element is clicked', () => {
    component.elementModel.src = 'test.mp4';
    fixture.detectChanges();
    const emitSpy = vi.spyOn(component.videoClicked, 'emit');
    const video = fixture.nativeElement.querySelector('video') as HTMLVideoElement;
    video.click();
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should dissolve dependency when the awaited media has finished', () => {
    component.elementModel.player.activeAfterID = 'other-media';
    component.mediaStatusChanged = new Subject<string>();
    fixture.detectChanges();
    expect(component.dependencyDissolved).toBe(false);
    component.mediaStatusChanged.next('other-media');
    expect(component.dependencyDissolved).toBe(true);
  });
});
