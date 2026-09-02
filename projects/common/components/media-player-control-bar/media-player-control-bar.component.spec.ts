import {
  ComponentFixture, TestBed, fakeAsync, tick, flush
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { BehaviorSubject } from 'rxjs';
import { PropertyGroupGenerators } from 'common/models/elements/property-group-interfaces';
import { MediaPlayerTimeFormatPipe } from 'common/pipes/media-player-time-format.pipe';
import { MediaPlayerControlBarComponent } from './media-player-control-bar.component';

describe('MediaPlayerControlBarComponent', () => {
  let component: MediaPlayerControlBarComponent;
  let fixture: ComponentFixture<MediaPlayerControlBarComponent>;
  let player: HTMLAudioElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MediaPlayerControlBarComponent,
        MediaPlayerTimeFormatPipe
      ],
      imports: [
        FormsModule,
        MatButtonModule,
        MatIconModule,
        MatSliderModule
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaPlayerControlBarComponent);
    component = fixture.componentInstance;
    player = document.createElement('audio');
    component.player = player;
    component.mediaSrc = 'test.mp3';
    component.type = 'audio';
    component.id = 'test-id';
    component.savedPlaybackTime = 0;
    component.playerProperties = PropertyGroupGenerators.generatePlayerProps();
    component.project = 'player';
    component.active = true;
    component.dependencyDissolved = true;
    component.hintDelay = 100;
    component.isLoaded = new BehaviorSubject<boolean>(false);
  });

  // Tests that depend on the delayed init() call ngOnInit directly:
  // its setTimeout is otherwise scheduled through the fixture's NgZone,
  // which is outside the test ProxyZone — fakeAsync/tick cannot flush it.
  it('should create and initialize with the default volume', fakeAsync(() => {
    component.ngOnInit();
    tick(); // flush delayed init
    expect(component).toBeTruthy();
    expect(component.volume).toBe(component.playerProperties.defaultVolume);
    expect(player.volume).toBe(component.playerProperties.defaultVolume);
  }));

  it('should toggle between rest time and elapsed time mode', () => {
    expect(component.restTimeMode).toBe(true);
    component.toggleTime();
    expect(component.restTimeMode).toBe(false);
    component.toggleTime();
    expect(component.restTimeMode).toBe(true);
  });

  it('should not lower the volume below minVolume', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    component.checkMinVolume(0.1); // minVolume default is 0.2
    expect(component.volume).toBe(0.2);
    component.checkMinVolume(0.5);
    expect(component.volume).toBe(0.5);
  }));

  it('should toggle the volume between minVolume and the last volume', fakeAsync(() => {
    component.ngOnInit();
    tick();
    expect(component.volume).toBe(0.8);
    component.toggleVolume();
    expect(component.volume).toBe(0.2);
    component.toggleVolume();
    expect(component.volume).toBe(0.8);
  }));

  it('should store the current time locally while not playing', () => {
    component.setCurrentTime(2);
    expect(component.playerCurrentTime).toBe(120);
  });

  it('should call play on the player element', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    const playSpy = vi.spyOn(player, 'play').mockResolvedValue(undefined);
    component.play();
    flush();
    expect(playSpy).toHaveBeenCalled();
  }));

  it('should call pause on the player element', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    const pauseSpy = vi.spyOn(player, 'pause');
    component.pause();
    expect(pauseSpy).toHaveBeenCalled();
  }));

  it('should update play status when the player starts playing', fakeAsync(() => {
    component.ngOnInit();
    tick();
    const emitSpy = vi.spyOn(component.mediaPlayStatusChanged, 'emit');
    player.dispatchEvent(new Event('playing'));
    expect(component.playing).toBe(true);
    expect(component.started).toBe(true);
    expect(emitSpy).toHaveBeenCalledWith('test-id');
    flush();
  }));

  it('should emit valid status and value when the media ends', fakeAsync(() => {
    component.ngOnInit();
    tick();
    const validSpy = vi.spyOn(component.mediaValidStatusChanged, 'emit');
    const valueSpy = vi.spyOn(component.elementValueChanged, 'emit');
    player.dispatchEvent(new Event('ended'));
    expect(validSpy).toHaveBeenCalledWith('test-id'); // minRuns default is 1
    expect(valueSpy).toHaveBeenCalledWith({ id: 'test-id', value: 1 });
    expect(component.disabled).toBe(true); // maxRuns default is 1
    flush();
  }));
});
