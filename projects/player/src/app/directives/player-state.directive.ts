import {
  Directive, Input, OnChanges, SimpleChanges
} from '@angular/core';
import { PlayerState } from 'player/modules/verona/models/verona';
import { VeronaPostService } from 'player/modules/verona/services/verona-post.service';
import { LogService } from 'player/modules/logging/services/log.service';

@Directive({
  selector: '[aspectPlayerState]'
})
export class PlayerStateDirective implements OnChanges {
  @Input() validPages!: Record<string, string>;
  @Input() currentPageIndex!: number;

  constructor(
    private veronaPostService: VeronaPostService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.currentPageIndex) {
      this.sendVopStateChangedNotification();
    }
  }

  private sendVopStateChangedNotification(): void {
    const playerState: PlayerState = {
      currentPage: this.currentPageIndex.toString(10),
      validPages: this.validPages
    };
    LogService.debug('player: sendVopStateChangedNotification', playerState);
    this.veronaPostService.sendVopStateChangedNotification({ playerState });
  }
}
