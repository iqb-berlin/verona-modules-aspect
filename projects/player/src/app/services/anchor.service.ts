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
      this.showAnchor(anchorId);
    }
  }

  showAnchor(anchorId: string): void {
    this.addAnchor(anchorId);
  }

  private addAnchor(anchorId: string): void {
    this.activeAnchors[anchorId] = of(true)
      .pipe(
        delay(this.duration))
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        anchor.attributes.style.textContent = `background-color: ${anchor.dataset.parentAnchorColor as string};`;
      } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        anchor.attributes.style.textContent = `background-color: ${anchor.dataset.anchorColor as string};`;
      }
      anchor.classList.toggle('active-anchor');
    });
    nestedAnchors.forEach(anchor => {
      if (showAnchor) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        anchor.attributes.style.textContent = `background-color: ${anchor.dataset.parentAnchorColor as string};`;
      } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        anchor.attributes.style.textContent = `background-color: ${anchor.dataset.anchorColor as string};`;
      }
      anchor.classList.toggle('active-nested-anchor');
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
