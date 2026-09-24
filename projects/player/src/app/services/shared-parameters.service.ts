import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { SharedParameter } from 'player/modules/verona/models/verona';

/**
 * Values the player shares with other modules through the host. The player API carries them in the
 * player state (`playerState.sharedParameters`); the host collects them and hands them on, a widget
 * in its `vowStartCommand`. The chemistry widgets read their field colours and bonding type there
 * (#1475).
 *
 * A share goes out at once, as part of a complete player state, which is why `PlayerStateDirective`
 * sends it and not the element that shares: the testcenter takes the page list of every player state
 * it receives, and one without pages would empty its navigation.
 */
@Injectable({
  providedIn: 'root'
})
export class SharedParametersService {
  private _shared = new Subject<SharedParameter[]>();

  readonly shared: Observable<SharedParameter[]> = this._shared.asObservable();

  /** Nothing is remembered: a subscriber that comes later does not learn of a share already made. */
  share(parameters: SharedParameter[]): void {
    this._shared.next(parameters);
  }
}
