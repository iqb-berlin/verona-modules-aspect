// eslint-disable-next-line max-classes-per-file
import {
  ComponentFixture, TestBed, fakeAsync, flushMicrotasks
} from '@angular/core/testing';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { FileService } from 'common/services/file.service';
import {
  Audio1StimulusComponent
} from 'editor/modules/section-templates/components/stimulus/audio1-stimulus/audio1-stimulus.component';

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

describe('Audio1StimulusComponent', () => {
  let component: Audio1StimulusComponent;
  let fixture: ComponentFixture<Audio1StimulusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        Audio1StimulusComponent,
        MockRichTextEditorComponent,
        MockWizardAudioComponent
      ],
      imports: [TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(Audio1StimulusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize without audio source and one allowed run', () => {
    expect(component.options.src1).toBeUndefined();
    expect(component.options.fileName1).toBeUndefined();
    expect(component.options.maxRuns1).toBe(1);
    expect(component.options.text).toBe('');
  });

  it('should set audio source and emit validity after loading a file', fakeAsync(() => {
    vi.spyOn(FileService, 'loadAudio').mockResolvedValue({ name: 'audio.mp3', content: 'audio-content' });
    const emitSpy = vi.spyOn(component.validityChange, 'emit');

    component.changeMediaSrc();
    flushMicrotasks();

    expect(component.options.src1).toBe('audio-content');
    expect(component.options.fileName1).toBe('audio.mp3');
    expect(emitSpy).toHaveBeenCalledWith(true);
  }));

  it('should load a new audio file when the audio row requests it', () => {
    const changeMediaSrcSpy = vi.spyOn(component, 'changeMediaSrc').mockResolvedValue();
    const audioRow = fixture.debugElement.query(By.directive(MockWizardAudioComponent));

    (audioRow.componentInstance as MockWizardAudioComponent).changeMediaSrc.emit();

    expect(changeMediaSrcSpy).toHaveBeenCalled();
  });
});
