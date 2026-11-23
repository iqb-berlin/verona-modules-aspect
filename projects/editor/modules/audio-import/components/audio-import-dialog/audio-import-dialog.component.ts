import {
  Component, Inject, OnDestroy, OnInit
} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import {
  Subject, catchError, debounceTime, finalize, from, of, switchMap, takeUntil
} from 'rxjs';
import { MessageService } from 'editor/src/app/services/message.service';
import {
  AudioImportDialogData, AudioImportOptions, EncodedAudio
} from 'editor/modules/audio-import/models/audio-import';
import { AudioTranscoder } from 'editor/modules/audio-import/utils/audio-transcoder';

/**
 * How long the dialog waits after a change of the options before it encodes again. The controls are
 * discrete, so this only has to catch a few clicks in a row; each encoding is a full pass over the
 * audio and cannot be stopped once it runs.
 */
export const ENCODE_DELAY = 150;

/**
 * Lets the author hear and size an imported audio before it goes into the unit.
 *
 * The dialog encodes itself and closes with the result: the preview needs the encoded file anyway,
 * and handing back only the options would encode the whole audio a second time on saving. Decoding
 * happens before the dialog opens, so it only ever sees audio the browser could read.
 *
 * Every way out without saving -- the cancel button, Escape, a click beside the dialog -- closes with
 * `undefined`. Escape and the backdrop cannot be given a value of their own, so the button does what
 * they do, and a caller has a single value to check for.
 */
@Component({
  selector: 'aspect-audio-import-dialog',
  templateUrl: './audio-import-dialog.component.html',
  styleUrls: ['./audio-import-dialog.component.scss'],
  standalone: false
})
export class AudioImportDialogComponent implements OnInit, OnDestroy {
  options: AudioImportOptions = { noiseFloor: true, quality: 'standard', channelMode: 'auto' };

  /** The audio encoded with the options on screen; `null` before the first result and after a failure. */
  encoded: EncodedAudio | null = null;

  /**
   * Whether `encoded` still belongs to an earlier setting. Saving waits for the current one, so what
   * the author heard last is what goes into the unit.
   */
  encodePending: boolean = true;

  private encodeRequested = new Subject<void>();
  private ngUnsubscribe = new Subject<void>();

  constructor(@Inject(MAT_DIALOG_DATA) public data: AudioImportDialogData,
              private messageService: MessageService,
              private translateService: TranslateService) { }

  ngOnInit(): void {
    /* `switchMap` drops the answer to a setting that has been overtaken, so an earlier encoding that
       finishes late cannot replace the current one -- and `finalize` aborts it, since dropping the
       answer alone would leave the encoding running beside the next one, and after the dialog has
       closed. Aborting one that has finished does nothing. The options are copied as they are now,
       since the controls keep writing into the same object while an encoding runs. */
    this.encodeRequested
      .pipe(
        debounceTime(ENCODE_DELAY),
        switchMap(() => {
          const abort = new AbortController();
          return from(AudioTranscoder.encode(this.data.decoded, { ...this.options }, abort.signal))
            .pipe(
              catchError(() => {
                this.messageService.showError(this.translateService.instant('audioImportDialog.encodingFailed'));
                return of(null);
              }),
              finalize(() => abort.abort())
            );
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(encoded => {
        this.encoded = encoded;
        this.encodePending = false;
      });
    this.encodeRequested.next();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onOptionsChange(): void {
    this.encodePending = true;
    this.encodeRequested.next();
  }
}
