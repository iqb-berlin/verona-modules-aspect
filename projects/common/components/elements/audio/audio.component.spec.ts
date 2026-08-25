// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { AudioElement, AudioProperties } from 'common/models/elements/audio';
import { PlayerProperties, PropertyGroupGenerators } from 'common/models/elements/property-group-interfaces';
import { ValueChangeElement } from 'common/models/input-element-interfaces';
import { AudioComponent } from './audio.component';

@Component({
  selector: 'aspect-media-player-control-bar',
  template: '<ng-content></ng-content>',
  standalone: false
})
class MockMediaPlayerControlBarComponent {
  @Input() player!: HTMLVideoElement | HTMLAudioElement;
  @Input() type!: 'video' | 'audio';
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

describe('AudioComponent', () => {
  let component: AudioComponent;
  let fixture: ComponentFixture<AudioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        AudioComponent,
        MockMediaPlayerControlBarComponent,
        MockSpinnerComponent
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AudioComponent);
    component = fixture.componentInstance;
    component.elementModel = new AudioElement({
      type: 'audio',
      id: 'test-id',
      alias: 'test-alias',
      src: 'test.mp3',
      fileName: 'test.mp3',
      player: PropertyGroupGenerators.generatePlayerProps(),
      styling: { backgroundColor: '#f1f1f1' }
    } as Partial<AudioProperties>);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render the control bar when src is set', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('aspect-media-player-control-bar')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('audio')).not.toBeNull();
  });

  it('should dissolve dependency when no activeAfterID is set', () => {
    fixture.detectChanges();
    expect(component.dependencyDissolved).toBe(true);
  });

  it('should dissolve dependency when the awaited media has finished', () => {
    component.elementModel.player.activeAfterID = 'other-media';
    component.mediaStatusChanged = new Subject<string>();
    fixture.detectChanges();
    expect(component.dependencyDissolved).toBe(false);
    component.mediaStatusChanged.next('other-media');
    expect(component.dependencyDissolved).toBe(true);
  });

  it('should only be active while no other media is playing', () => {
    component.actualPlayingId = new Subject<string | null>();
    fixture.detectChanges();
    component.actualPlayingId.next('other-media');
    expect(component.active).toBe(false);
    component.actualPlayingId.next('test-id');
    expect(component.active).toBe(true);
    component.actualPlayingId.next(null);
    expect(component.active).toBe(true);
  });

  it('should forward elementValueChanged from the control bar', () => {
    fixture.detectChanges();
    const emitSpy = vi.spyOn(component.elementValueChanged, 'emit');
    const controlBar = fixture.debugElement
      .query(element => element.componentInstance instanceof MockMediaPlayerControlBarComponent)
      .componentInstance as MockMediaPlayerControlBarComponent;
    controlBar.elementValueChanged.emit({ id: 'test-id', value: 0.5 });
    expect(emitSpy).toHaveBeenCalledWith({ id: 'test-id', value: 0.5 });
  });

  it('should provide a timeout message with alias and file name', () => {
    expect(component.timeoutMsg).toContain('test-alias');
    expect(component.timeoutMsg).toContain('test.mp3');
  });
});
