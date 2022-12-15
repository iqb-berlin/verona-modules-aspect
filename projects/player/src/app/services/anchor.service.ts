import { Injectable } from '@angular/core';
import { delay, of, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnchorService {
  private activeAnchors: { [id: string]: Subscription } = {};

  toggleAnchor(anchorId: string) {
    if (this.activeAnchors[anchorId]) {
      this.removeAnchor(anchorId);
    } else {
      this.reset();
      this.addAnchor(anchorId);
    }
  }

  private addAnchor(anchorId: string): void {
    this.activeAnchors[anchorId] = of(true)
      .pipe(
        delay(15000))
      .subscribe(() => {
        this.removeAnchor(anchorId);
      });
    AnchorService.toggleAnchorRendering(anchorId, true);
  }

  private removeAnchor(anchorId: string): void {
    this.activeAnchors[anchorId].unsubscribe();
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
        anchor.style.backgroundColor = anchor.dataset.parentAnchorColor as string;
      } else {
        anchor.style.backgroundColor = anchor.dataset.anchorColor as string;
      }
      anchor.classList.toggle('active-anchor');
    });
    nestedAnchors.forEach(anchor => {
      if (showAnchor) {
        anchor.style.backgroundColor = (anchor.dataset.parentAnchorColor) as string;
      } else {
        anchor.style.backgroundColor = anchor.dataset.anchorColor as string;
      }
      anchor.classList.toggle('active-nested-anchor');
    });
    if (anchors.length && showAnchor) {
      anchors[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  reset(): void {
    Object.keys(this.activeAnchors).forEach(anchorId => this.removeAnchor(anchorId));
  }
}
