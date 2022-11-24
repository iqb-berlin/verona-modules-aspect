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
      this.addAnchor(anchorId);
    }
  }

  private addAnchor(anchorId: string): void {
    this.activeAnchors[anchorId] = of(true)
      .pipe(
        delay(30000))
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

  private static toggleAnchorRendering(anchorId: string, shouldScroll: boolean): void {
    const anchors = document.querySelectorAll(`aspect-anchor[data-anchor-id="${anchorId}"]`);
    anchors.forEach(anchor => anchor.classList.toggle('active-anchor'));
    if (shouldScroll) anchors.item(0).scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  reset(): void {
    Object.keys(this.activeAnchors).forEach(anchorId => this.removeAnchor(anchorId));
  }
}
