import { ApplicationRef } from '@angular/core';
import {
  ComponentFixture, TestBed, fakeAsync, flush, tick
} from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'editor/src/app/services/message.service';
import { AudioImportModule } from 'editor/modules/audio-import/audio-import.module';
import {
  AudioImportDialogData, AudioImportOptions, EncodedAudio
} from 'editor/modules/audio-import/models/audio-import';
import { AudioTranscoder } from 'editor/modules/audio-import/utils/audio-transcoder';
import { AudioImportDialogComponent, ENCODE_DELAY } from './audio-import-dialog.component';

/* `AudioTranscoder.encode` is replaced throughout: what it produces is its own spec's business. This
   one is about when the dialog asks for an encoding, with which options, and which answer it keeps. */
describe('AudioImportDialogComponent', () => {
  let fixture: ComponentFixture<AudioImportDialogComponent>;
  let dialogRef: { close: ReturnType<typeof vi.fn> };
  let messageService: { showError: ReturnType<typeof vi.fn> };
  const decoded = new AudioBuffer({ numberOfChannels: 2, length: 480, sampleRate: 48000 });
  const defaults: AudioImportOptions = { noiseFloor: true, quality: 'standard', channelMode: 'auto' };

  const encodedAudio = (size: number): EncodedAudio => ({
    content: `data:audio/webm;base64,${'A'.repeat(4)}`, size, channelCount: 1
  });

  /** A promise the test settles by hand, to decide in which order encodings finish. */
  const deferred = () => {
    let resolve!: (value: EncodedAudio) => void;
    const promise = new Promise<EncodedAudio>(res => { resolve = res; });
    return { promise, resolve };
  };

  const createDialog = (expertMode: boolean = false): void => {
    dialogRef = { close: vi.fn() };
    messageService = { showError: vi.fn() };
    TestBed.configureTestingModule({
      imports: [AudioImportModule, TranslateModule.forRoot()],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { decoded, originalSize: 100000, expertMode } },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MessageService, useValue: messageService }
      ]
    });
    fixture = TestBed.createComponent(AudioImportDialogComponent);
    fixture.detectChanges();
  };

  const element = <T extends HTMLElement>(selector: string): T | null => fixture.nativeElement.querySelector(selector);
  const saveButton = (): HTMLButtonElement => element<HTMLButtonElement>('.save-button') as HTMLButtonElement;

  it('should encode once with the default options when it opens', fakeAsync(() => {
    const encode = vi.spyOn(AudioTranscoder, 'encode').mockResolvedValue(encodedAudio(1000));
    createDialog();
    tick(ENCODE_DELAY - 1);
    expect(encode).not.toHaveBeenCalled();
    tick(1);
    expect(encode).toHaveBeenCalledTimes(1);
    expect(encode).toHaveBeenCalledWith(decoded, defaults, expect.any(AbortSignal));
  }));

  it('should encode once with every option changed in quick succession', fakeAsync(() => {
    const encode = vi.spyOn(AudioTranscoder, 'encode').mockResolvedValue(encodedAudio(1000));
    createDialog(true);
    tick(ENCODE_DELAY);
    fixture.detectChanges();

    element('.noise-floor-checkbox input')?.click();
    element('.quality-high button')?.click();
    element('.channels-mono button')?.click();
    tick(ENCODE_DELAY);

    expect(encode).toHaveBeenCalledTimes(2);
    expect(encode).toHaveBeenLastCalledWith(
      decoded, { noiseFloor: false, quality: 'high', channelMode: 'mono' }, expect.any(AbortSignal)
    );
  }));

  it('should abort an overtaken encoding, and the running one when the dialog closes', fakeAsync(() => {
    const encode = vi.spyOn(AudioTranscoder, 'encode').mockReturnValue(new Promise(() => {}));
    createDialog();
    tick(ENCODE_DELAY);
    fixture.detectChanges();

    element('.noise-floor-checkbox input')?.click();
    tick(ENCODE_DELAY);
    const [overtaken, running] = encode.mock.calls.map(call => call[2] as AbortSignal);
    expect(overtaken.aborted).toBe(true);
    expect(running.aborted).toBe(false);

    fixture.destroy();
    expect(running.aborted).toBe(true);
  }));

  it('should keep the result of the current options when an overtaken encoding finishes late', fakeAsync(() => {
    const first = deferred();
    const second = deferred();
    vi.spyOn(AudioTranscoder, 'encode')
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);
    createDialog();
    tick(ENCODE_DELAY);
    fixture.detectChanges();

    element('.noise-floor-checkbox input')?.click();
    tick(ENCODE_DELAY);
    second.resolve(encodedAudio(2000));
    tick();
    first.resolve(encodedAudio(1000));
    tick();

    expect(fixture.componentInstance.encoded?.size).toBe(2000);
  }));

  it('should offer saving only for the result of the options on screen', fakeAsync(() => {
    const first = deferred();
    vi.spyOn(AudioTranscoder, 'encode')
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(new Promise(() => {}));
    createDialog();
    tick(ENCODE_DELAY);
    fixture.detectChanges();
    expect(saveButton().disabled).toBe(true);

    const result = encodedAudio(1000);
    first.resolve(result);
    tick();
    fixture.detectChanges();
    expect(saveButton().disabled).toBe(false);
    saveButton().click();
    expect(dialogRef.close).toHaveBeenCalledWith(result);

    element('.noise-floor-checkbox input')?.click();
    fixture.detectChanges();
    expect(saveButton().disabled).toBe(true);
    tick(ENCODE_DELAY);
  }));

  /* The error has to be caught inside the `switchMap`: caught outside, it would end the stream, and
     no later change of the options would encode again. */
  it('should report a failed encoding, offer no saving and encode again on the next change', fakeAsync(() => {
    const encode = vi.spyOn(AudioTranscoder, 'encode')
      .mockRejectedValueOnce(new Error('encoder failed'))
      .mockResolvedValueOnce(encodedAudio(1000));
    createDialog();
    tick(ENCODE_DELAY);
    fixture.detectChanges();

    expect(messageService.showError).toHaveBeenCalledWith('audioImportDialog.encodingFailed');
    expect(saveButton().disabled).toBe(true);

    element('.noise-floor-checkbox input')?.click();
    tick(ENCODE_DELAY);
    fixture.detectChanges();

    expect(encode).toHaveBeenCalledTimes(2);
    expect(saveButton().disabled).toBe(false);
  }));

  [false, true].forEach(expertMode => {
    it(`should offer quality and channels only in the expert mode (expert mode: ${expertMode})`, fakeAsync(() => {
      vi.spyOn(AudioTranscoder, 'encode').mockResolvedValue(encodedAudio(1000));
      createDialog(expertMode);
      tick(ENCODE_DELAY);

      expect(element('.quality-toggle') !== null).toBe(expertMode);
      expect(element('.channels-toggle') !== null).toBe(expertMode);
    }));
  });

  /* Opened by the real `MatDialog`, since Escape is handled by the dialog's overlay and not by
     anything in the component: the caller gets one value for every way out without saving. */
  describe('closing without saving', () => {
    const ways: Record<string, () => void> = {
      'the cancel button': () => document.querySelector<HTMLButtonElement>('.cancel-button')?.click(),
      Escape: () => document.body.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Escape', keyCode: 27, bubbles: true
      }))
    };

    Object.entries(ways).forEach(([way, close]) => {
      it(`should close with undefined through ${way}`, fakeAsync(() => {
        vi.spyOn(AudioTranscoder, 'encode').mockReturnValue(new Promise(() => {}));
        TestBed.configureTestingModule({
          imports: [AudioImportModule, TranslateModule.forRoot()],
          providers: [{ provide: MessageService, useValue: { showError: vi.fn() } }]
        });
        const data: AudioImportDialogData = { decoded, originalSize: 100000, expertMode: false };
        const opened = TestBed.inject(MatDialog)
          .open<AudioImportDialogComponent, AudioImportDialogData, EncodedAudio>(AudioImportDialogComponent, { data });
        const closed = vi.fn();
        opened.afterClosed().subscribe(closed);
        TestBed.inject(ApplicationRef).tick();
        flush();

        close();
        flush();

        expect(closed).toHaveBeenCalledWith(undefined);
      }));
    });
  });
});
