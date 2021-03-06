import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MediaPlayerGroupElementComponent } from './media-player-group-element.component';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ValueChangeElement } from 'common/models/elements/element';
import { CastPipe } from 'player/src/app/pipes/cast.pipe';
import { UnitStateService } from 'player/src/app/services/unit-state.service';
import { Subject } from 'rxjs';
import { AudioElement } from 'common/models/elements/media-elements/audio';

describe('MediaPlayerGroupElementComponent', () => {
  let component: MediaPlayerGroupElementComponent;
  let fixture: ComponentFixture<MediaPlayerGroupElementComponent>;
  let mockUnitStateService: UnitStateService;

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
    mockUnitStateService = TestBed.inject(UnitStateService);
    fixture = TestBed.createComponent(MediaPlayerGroupElementComponent);
    spyOn(mockUnitStateService, 'registerElement');
    spyOn(mockUnitStateService, 'getElementCodeById').withArgs('test').and
      .returnValue({ id: 'test', status: 'NOT_REACHED', value: 0 });
    component = fixture.componentInstance;
    component.elementModel = new AudioElement({
      type: 'audio',
      id: 'test',
      width: 0,
      height: 0
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
