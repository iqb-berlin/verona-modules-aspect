import { Directive, EventEmitter, Output } from '@angular/core';
import { ElementComponent } from './element-component.directive';
import { ValueChangeElement } from '../interfaces/elements';

@Directive()
export abstract class MediaPlayerElementComponent extends ElementComponent {
  @Output() elementValueChanged = new EventEmitter<ValueChangeElement>();
  @Output() onMediaPlayStatusChanged = new EventEmitter<string | null>();
  @Output() onMediaValidStatusChanged = new EventEmitter<string>();

  active: boolean = true;
  dependencyDissolved!: boolean;

  setActualPlayingMediaId(id: string | null): void {
    this.active = !id || id === this.elementModel.id;
  }

  setActivatedAfterID(): void {
    this.dependencyDissolved = true;
  }
}
