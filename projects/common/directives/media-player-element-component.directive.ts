import {
  Directive, EventEmitter, Input, OnDestroy, OnInit, Output
} from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AudioElement } from 'common/models/elements/media-elements/audio';
import { VideoElement } from 'common/models/elements/media-elements/video';
import { ValueChangeElement } from 'common/interfaces';
import { ElementComponent } from './element-component.directive';

@Directive()
export abstract class MediaPlayerElementComponent extends ElementComponent implements OnInit, OnDestroy {
  @Input() savedPlaybackTime!: number;
  @Input() actualPlayingId!: Subject<string | null>;
  @Input() mediaStatusChanged!: Subject<string>;
  @Output() elementValueChanged = new EventEmitter<ValueChangeElement>();
  @Output() mediaPlayStatusChanged = new EventEmitter<string | null>();
  @Output() mediaValidStatusChanged = new EventEmitter<string>();

  abstract elementModel: AudioElement | VideoElement;
  active: boolean = true;
  isLoaded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  dependencyDissolved!: boolean;
  private ngUnsubscribe = new Subject<void>();

  get timeoutMsg(): string {
    // eslint-disable-next-line max-len
    return `Failed to load media element with alias "${this.elementModel.alias}" and filename "${this.elementModel.fileName}" in time`;
  }

  get mediaDurationNotAvailableMsg(): string {
    // eslint-disable-next-line max-len
    return `Media duration of element with alias "${this.elementModel.alias}" and filename "${this.elementModel.fileName}" is not available`;
  }

  ngOnInit(): void {
    this.dependencyDissolved = !this.elementModel.player.activeAfterID;
    if (this.actualPlayingId) {
      this.actualPlayingId
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((actualID: string | null): void => this.setActualPlayingMediaId(actualID));
    }
    if (this.mediaStatusChanged) {
      this.mediaStatusChanged
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((id: string): void => this.setActivatedAfterID(id));
    }
  }

  private setActualPlayingMediaId(id: string | null): void {
    this.active = !id || id === this.elementModel.id;
  }

  private setActivatedAfterID(id: string): void {
    if (!this.dependencyDissolved) {
      this.dependencyDissolved = id === (this.elementModel).player.activeAfterID;
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
