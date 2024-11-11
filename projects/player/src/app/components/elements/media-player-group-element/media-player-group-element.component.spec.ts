import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { Subject } from 'rxjs';
import { AudioElement } from 'common/models/elements/media-elements/audio';
import { ValueChangeElement } from 'common/interfaces';
import { CastPipe } from 'player/src/app/pipes/cast.pipe';
import { MediaPlayerGroupElementComponent } from './media-player-group-element.component';

describe('MediaPlayerGroupElementComponent', () => {
  let component: MediaPlayerGroupElementComponent;
  let fixture: ComponentFixture<MediaPlayerGroupElementComponent>;

  @Component({ selector: 'aspect-audio', template: '' })
  class AudioStubComponent {
    @Input() elementModel!: AudioElement;
    @Input() savedPlaybackTime!: number;
    @Input() actualPlayingId!: Subject<string | null>;
    @Input() mediaStatusChanged!: Subject<string>;
    @Output() elementValueChanged = new EventEmitter<ValueChangeElement>();
    @Output() onMediaPlayStatusChanged = new EventEmitter<string | null>();
    @Output() onMediaValidStatusChanged = new EventEmitter<string>();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MediaPlayerGroupElementComponent,
        AudioStubComponent,
        CastPipe
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaPlayerGroupElementComponent);
    component = fixture.componentInstance;
    component.elementModel = new AudioElement({ id: 'id', alias: 'alias' });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
