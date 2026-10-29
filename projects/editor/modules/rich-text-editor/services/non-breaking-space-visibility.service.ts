import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Whether the text editors mark non-breaking spaces (#1476). One switch for every text editor of the session, so that
 * editors open side by side -- the options of a drop list, the rows of a likert -- show the same; it starts off and is
 * not kept beyond a reload.
 */
@Injectable({
  providedIn: 'root'
})
export class NonBreakingSpaceVisibilityService {
  readonly visible = new BehaviorSubject<boolean>(false);

  toggle(): void {
    this.visible.next(!this.visible.value);
  }
}
