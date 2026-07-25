// eslint-disable-next-line max-classes-per-file
import {
  ComponentFixture, TestBed, fakeAsync, flushMicrotasks
} from '@angular/core/testing';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FileService } from 'common/services/file.service';
import {
  Audio2StimulusComponent
} from 'editor/modules/section-templates/components/stimulus/audio2-stimulus/audio2-stimulus.component';

@Component({
  standalone: false,
  selector: 'aspect-rich-text-editor',
  template: ''
})
class MockRichTextEditorComponent {
  @Input() content: string = '';
  @Input() placeholder: string = '';
  @Input() showReducedControls: boolean = false;
  @Output() contentChange = new EventEmitter<string>();
}

@Component({
  standalone: false,
  selector: 'aspect-editor-wizard-audio',
  template: ''
})
class MockWizardAudioComponent {
  @Input() src: string | undefined;
  @Input() maxRuns!: number;
  @Output() maxRunsChange = new EventEmitter<number>();
  @Output() changeMediaSrc = new EventEmitter<void>();
}

describe('Audio2StimulusComponent', () => {
  let component: Audio2StimulusComponent;
  let fixture: ComponentFixture<Audio2StimulusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        Audio2StimulusComponent,
        MockRichTextEditorComponent,
        MockWizardAudioComponent
      ],
      imports: [
        FormsModule,
        MatRadioModule,
        MatTooltipModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Audio2StimulusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize without audio sources and German language', () => {
    expect(component.options.src1).toBeUndefined();
    expect(component.options.src2).toBeUndefined();
    expect(component.options.maxRuns1).toBe(1);
    expect(component.options.maxRuns2).toBe(2);
    expect(component.options.lang).toBe('german');
  });

  it('should set the instruction audio source after loading a file', fakeAsync(() => {
    vi.spyOn(FileService, 'loadAudio').mockResolvedValue({ name: 'intro.mp3', content: 'intro-content' });

    component.changeMediaSrc('src1');
    flushMicrotasks();

    expect(component.options.src1).toBe('intro-content');
    expect(component.options.fileName1).toBe('intro.mp3');
    expect(component.options.src2).toBeUndefined();
  }));

  it('should set the stimulus audio source after loading a file', fakeAsync(() => {
    vi.spyOn(FileService, 'loadAudio').mockResolvedValue({ name: 'stimulus.mp3', content: 'stimulus-content' });

    component.changeMediaSrc('src2');
    flushMicrotasks();

    expect(component.options.src2).toBe('stimulus-content');
    expect(component.options.fileName2).toBe('stimulus.mp3');
  }));

  it('should not emit validity while one audio source is missing', () => {
    const emitSpy = vi.spyOn(component.validityChange, 'emit');
    component.options.src1 = 'intro-content';

    component.checkValidity();

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should emit validity when both audio sources are set', () => {
    const emitSpy = vi.spyOn(component.validityChange, 'emit');
    component.options.src1 = 'intro-content';
    component.options.src2 = 'stimulus-content';

    component.checkValidity();

    expect(emitSpy).toHaveBeenCalledWith(true);
  });
});
