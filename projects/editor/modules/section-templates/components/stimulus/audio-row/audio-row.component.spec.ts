import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  AudioRowComponent
} from 'editor/modules/section-templates/components/stimulus/audio-row/audio-row.component';

describe('AudioRowComponent', () => {
  let component: AudioRowComponent;
  let fixture: ComponentFixture<AudioRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AudioRowComponent],
      imports: [
        FormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatTooltipModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AudioRowComponent);
    component = fixture.componentInstance;
    component.maxRuns = 1;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the audio element semi-transparent without a source', () => {
    const audio = fixture.nativeElement.querySelector('audio') as HTMLAudioElement;
    expect(audio.style.opacity).toBe('0.5');

    component.src = 'data:audio/mp3;base64,abc';
    fixture.detectChanges();
    expect(audio.style.opacity).toBe('1');
  });

  it('should emit changeMediaSrc when the upload button is clicked', () => {
    const emitSpy = vi.spyOn(component.changeMediaSrc, 'emit');
    const uploadButton = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    uploadButton.click();

    expect(emitSpy).toHaveBeenCalled();
  });

  it('should emit maxRunsChange when the input value changes', () => {
    const emitSpy = vi.spyOn(component.maxRunsChange, 'emit');
    const input = fixture.nativeElement.querySelector('input[type="number"]') as HTMLInputElement;

    input.value = '5';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(emitSpy).toHaveBeenCalledWith(5);
  });
});
