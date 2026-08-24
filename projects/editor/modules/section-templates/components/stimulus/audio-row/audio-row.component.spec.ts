import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { MessageService } from 'editor/src/app/services/message.service';
import {
  NumberFieldBadInputDirective
} from 'editor/modules/editor-shared/directives/number-field-bad-input.directive';
import { NumberFieldDirective } from 'editor/modules/editor-shared/directives/number-field.directive';
import {
  AudioRowComponent
} from 'editor/modules/section-templates/components/stimulus/audio-row/audio-row.component';

describe('AudioRowComponent', () => {
  let component: AudioRowComponent;
  let fixture: ComponentFixture<AudioRowComponent>;
  let messageService: SpyObj<MessageService>;

  beforeEach(async () => {
    messageService = createSpyObj<MessageService>(['showWarning']);

    await TestBed.configureTestingModule({
      declarations: [AudioRowComponent, NumberFieldDirective, NumberFieldBadInputDirective],
      imports: [
        FormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatTooltipModule,
        TranslateModule.forRoot()
      ],
      providers: [{ provide: MessageService, useValue: messageService }]
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

  /* `min="1"` was on the box and enforced nowhere, and the binding was two-way: a 0 or an emptied
     box reached the generated element, where 0 means "no limit" to the player - the opposite of
     what the box asks for (#1164). */
  it('should refuse a play count below the minimum and put the box back', async () => {
    const emitSpy = vi.spyOn(component.maxRunsChange, 'emit');
    const input = fixture.nativeElement.querySelector('input[type="number"]') as HTMLInputElement;

    input.value = '0';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(emitSpy).not.toHaveBeenCalled();
    expect(component.maxRuns).toBe(1);
    expect(input.value).toBe('1');
    expect(messageService.showWarning).toHaveBeenCalledTimes(1);
  });
});
