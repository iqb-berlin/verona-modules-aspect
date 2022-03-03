import {
  Directive, EventEmitter, Input, OnInit, Output
} from '@angular/core';
import { Subject } from 'rxjs';
import { ElementComponent } from './element-component.directive';
import { AudioElement, ValueChangeElement, VideoElement } from '../interfaces/elements';

@Directive()
export abstract class MediaPlayerElementComponent extends ElementComponent implements OnInit {
  @Input() savedPlaybackTime!: number;
  @Input() actualPlayingId!: Subject<string | null>;
  @Input() mediaStatusChanged!: Subject<string>;
  @Output() elementValueChanged = new EventEmitter<ValueChangeElement>();
  @Output() onMediaPlayStatusChanged = new EventEmitter<string | null>();
  @Output() onMediaValidStatusChanged = new EventEmitter<string>();

  abstract elementModel: AudioElement | VideoElement;
  active: boolean = true;
  dependencyDissolved!: boolean;

  ngOnInit(): void {
    if (this.actualPlayingId) {
      this.actualPlayingId
        .subscribe((actualID: string | null): void => this.setActualPlayingMediaId(actualID));
    }
    if (this.mediaStatusChanged) {
      this.mediaStatusChanged
        .subscribe((id: string): void => this.setActivatedAfterID(id));
    }
  }

  private setActualPlayingMediaId(id: string | null): void {
    this.active = !id || id === this.elementModel.id;
  }

  private setActivatedAfterID(id: string): void {
    if (!this.dependencyDissolved) {
      this.dependencyDissolved = id === (this.elementModel).playerProps.activeAfterID;
    }
  }
}
