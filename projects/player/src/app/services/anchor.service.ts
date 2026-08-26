import { Injectable } from '@angular/core';
import { delay, of, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnchorService {
  private activeAnchors: { [id: string]: Subscription } = {};
  private duration = 60000;

  toggleAnchor(anchorId: string): void {
    if (this.activeAnchors[anchorId]) {
      this.removeAnchor(anchorId);
    } else {
      this.reset();
      this.showAnchor(anchorId);
    }
  }

  showAnchor(anchorId: string): void {
    this.addAnchor(anchorId);
  }

  private addAnchor(anchorId: string): void {
    // Highlighting a passage that is already highlighted restarts its minute, so the subscription
    // that was there has to be unsubscribed rather than overwritten. Left running it hides the
    // passage when ITS minute is up -- earlier than the one just asked for. And once the passage
    // has been hidden regularly in between, that orphan fires against an entry that is gone, which
    // is the `TypeError` in #1346. The trigger action `highlightText` reaches `showAnchor`
    // unguarded, so a second call is a normal thing to happen, not a mistake.
    this.activeAnchors[anchorId]?.unsubscribe();
    this.activeAnchors[anchorId] = of(true)
      .pipe(
        delay(this.duration))
      .subscribe(() => {
        this.removeAnchor(anchorId);
      });
    AnchorService.toggleAnchorRendering(anchorId, true);
  }

  private removeAnchor(anchorId: string): void {
    // Written so that a missing entry costs nothing: unsubscribing is optional, deleting an absent
    // key is a no-op, and hiding is idempotent. That leaves no branch that only a state the code
    // can no longer reach would take -- and no `TypeError` if it ever reaches it again (#1346).
    this.activeAnchors[anchorId]?.unsubscribe();
    delete this.activeAnchors[anchorId];
    AnchorService.toggleAnchorRendering(anchorId, false);
  }

  private static toggleAnchorRendering(anchorId: string, showAnchor: boolean): void {
    const anchors = Array.from(
      document.querySelectorAll(`aspect-anchor[data-anchor-id="${anchorId}"]`)
    ) as HTMLElement[];
    const nestedAnchors = Array.from(
      document.querySelectorAll(`aspect-anchor[data-parent-anchor-id="${anchorId}"]`)
    ) as HTMLElement[];
    anchors.forEach(anchor => {
      if (!showAnchor && anchor.dataset.parentAnchorColor) {
        anchor.style.backgroundColor = anchor.dataset.parentAnchorColor;
      } else {
        anchor.style.backgroundColor = anchor.dataset.anchorColor as string;
      }
      // With the state passed in, rendering the same anchor twice keeps it shown instead of
      // flipping it off -- which is what a repeated `highlightText` does (#1346).
      anchor.classList.toggle('active-anchor', showAnchor);
    });
    nestedAnchors.forEach(anchor => {
      if (showAnchor) {
        anchor.style.backgroundColor = anchor.dataset.parentAnchorColor as string;
      } else {
        anchor.style.backgroundColor = anchor.dataset.anchorColor as string;
      }
      anchor.classList.toggle('active-nested-anchor', showAnchor);
    });
    if (anchors.length && showAnchor) {
      anchors[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  hideAllAnchors(): void {
    this.reset();
  }

  reset(): void {
    Object.keys(this.activeAnchors).forEach(anchorId => this.removeAnchor(anchorId));
  }
}
