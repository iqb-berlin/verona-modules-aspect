import {
  Directive, EventEmitter, Input, OnDestroy, OnInit, Output
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ElementComponent } from './element-component.directive';
import { ValueChangeElement } from 'common/interfaces/elements';
import { AudioElement, VideoElement } from 'common/classes/element';

@Directive()
export abstract class MediaPlayerElementComponent extends ElementComponent implements OnInit, OnDestroy {
  @Input() savedPlaybackTime!: number;
  @Input() actualPlayingId!: Subject<string | null>;
  @Input() mediaStatusChanged!: Subject<string>;
  @Output() elementValueChanged = new EventEmitter<ValueChangeElement>();
  @Output() onMediaPlayStatusChanged = new EventEmitter<string | null>();
  @Output() onMediaValidStatusChanged = new EventEmitter<string>();

  abstract elementModel: AudioElement | VideoElement;
  active: boolean = true;
  dependencyDissolved!: boolean;
  private ngUnsubscribe = new Subject<void>();

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
