import {
  ChangeDetectorRef, Component, ElementRef, EventEmitter,
  Input, OnDestroy, OnInit, Output, ViewChild
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TetfolioElement } from 'common/models/elements/tetfolio';
import { ValueChangeElement } from 'common/models/input-element-interfaces';
import { TetfolioBridge } from 'common/utils/tetfolio-bridge';
import { TetfolioScaling } from 'common/utils/tetfolio-scaling';
import { ElementComponent } from 'common/directives/element-component.directive';
import { BehaviorSubject } from 'rxjs';

/**
 * Renders a tetfolio element's packed HTML document in an iframe and relays the resize and state
 * messages the embedded app posts back over the bridge. The document is handed over via `srcdoc`,
 * not a blob URL: hosts like the Testcenter run the player under the policy `frame-src 'self'`,
 * which refuses `blob:` frames and lets `srcdoc` pass. The iframe is NOT sandboxed - a srcdoc
 * document shares the player's origin, and the bridge relies on that (storage, postMessage source
 * checks). What that lets the content reach is described in docs/tetfolio-element.md.
 *
 * An experiment wider than the element is scaled down to the element's width (`TetfolioScaling`):
 * the iframe is laid out at the width the bridge reports the page needs and shrunk with a CSS
 * transform, which leaves the experiment's own coordinates - and so its clicks and drags - intact.
 */
@Component({
  selector: 'aspect-tetfolio',
  templateUrl: './tetfolio.component.html',
  styleUrls: ['./tetfolio.component.scss'],
  standalone: false
})
export class TetfolioComponent extends ElementComponent implements OnInit, OnDestroy {
  @Input() elementModel!: TetfolioElement;
  @Input() savedState: string | null = null;
  @Output() elementValueChanged = new EventEmitter<ValueChangeElement>();
  @ViewChild('tetfolioIframe') tetfolioIframe!: ElementRef<HTMLIFrameElement>;

  iframeContent: SafeHtml | null = null;
  /** The height the content last reported; until the first report, the authored height. */
  contentHeight: number = 300;
  /** The width the content last reported it needs to show uncut; 0 until it has. */
  contentWidth: number = 0;
  /** The width the element gives the experiment; 0 until it has been measured. */
  availableWidth: number = 0;
  /**
   * How far the experiment is scaled down to fit the element's width (`TetfolioScaling`). The iframe
   * is laid out at the reciprocal size, so that it fills the element again once scaled.
   */
  scale: number = 1;
  /**
   * The element's height while it is not fixed: the content's, scaled, and clamped to the authored
   * bounds. A fixed height is the container's, which the scaled iframe fills.
   */
  frameHeight: number = 300;
  /** False while a saved state is being restored inside the iframe; drives the overlay and
     the spinner, the same way geometry and the media players use it. */
  isLoaded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private messageListener: ((event: MessageEvent) => void) | null = null;
  private widthObserver: ResizeObserver | null = null;

  constructor(
    elementRef: ElementRef,
    private sanitizer: DomSanitizer,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super(elementRef);
  }

  ngOnInit(): void {
    this.initIframe();
    this.setupMessageListener();
    this.observeAvailableWidth();
  }

  /** The restore took longer than the spinner allows: the experiment is still usable, so the
     overlay goes without an error - unlike geometry, a late restore is no failure. */
  onRestoreTimeout(): void {
    this.isLoaded.next(true);
  }

  /** Re-create the iframe after htmlContent has changed (used by the editor). */
  refresh(): void {
    // Two passes: the first removes the old iframe, the second builds a new one - so the
    // document starts from scratch even when the content is the same string as before.
    this.iframeContent = null;
    this.changeDetectorRef.detectChanges();
    this.initIframe();
    this.changeDetectorRef.detectChanges();
  }

  private initIframe(): void {
    // Nothing to restore means nothing to wait for: the overlay shows only for a saved state.
    this.isLoaded.next(!this.savedState);
    // A new document starts from the authored height, not from what the previous one reported,
    // and unscaled until it reports the width it needs.
    this.contentHeight = this.elementModel.dimensions.height;
    this.contentWidth = 0;
    this.updateLayout();
    if (this.elementModel.htmlContent) {
      const html = TetfolioBridge.inject(this.elementModel.htmlContent, this.savedState, this.elementModel.id);
      this.iframeContent = this.sanitizer.bypassSecurityTrustHtml(html);
    }
  }

  private setupMessageListener(): void {
    this.messageListener = (event: MessageEvent) => this.handleMessage(event);
    window.addEventListener('message', this.messageListener);
  }

  /** The host fills the width the element is given, in the player as on the editor's canvas. */
  private observeAvailableWidth(): void {
    this.widthObserver = new ResizeObserver(entries => {
      const width = entries[entries.length - 1].contentRect.width;
      if (width === this.availableWidth) return;
      this.availableWidth = width;
      this.updateLayout();
      this.changeDetectorRef.detectChanges();
    });
    this.widthObserver.observe(this.elementRef.nativeElement);
  }

  private handleMessage(event: MessageEvent): void {
    if (!this.tetfolioIframe?.nativeElement?.contentWindow) return;
    if (event.source !== this.tetfolioIframe.nativeElement.contentWindow) return;
    if (event.data?.type === 'tetfolioResize') {
      this.onResize(event.data.height, event.data.width);
    }
    if (event.data?.type === 'tetfolioStateChanged') {
      this.onStateChanged(event.data.state);
    }
    if (event.data?.type === 'tetfolioReady') {
      this.isLoaded.next(true);
    }
  }

  /**
   * Records the content's size. It is recorded with a fixed height too, where the template does not
   * show the height - the iframe fills the container then - so that switching the height back to
   * following needs no new report. A report without a width (from a document the bridge cannot
   * measure) keeps the width known so far.
   */
  private onResize(height: number, width?: number): void {
    if (!height || height <= 0) return;
    this.contentHeight = height;
    if (width && width > 0) this.contentWidth = width;
    this.updateLayout();
    this.changeDetectorRef.detectChanges();
  }

  /**
   * Derives the scale and the element's height from the sizes known so far. The authored min/max
   * bounds are read every time, so a change in the properties panel applies with the next report.
   * They bound what the element shows, i.e. the content's height after scaling.
   */
  private updateLayout(): void {
    this.scale = TetfolioScaling.scaleFor(this.availableWidth, this.contentWidth);
    const { minHeight, maxHeight } = this.elementModel.dimensions;
    this.frameHeight = Math.min(
      Math.max(this.contentHeight * this.scale, minHeight || 0),
      maxHeight || Number.MAX_SAFE_INTEGER
    );
  }

  /**
   * Only emits; what becomes of the state is the player group element's job. Keeping it out of the
   * model also keeps a state reached in the editor preview out of the unit definition.
   */
  private onStateChanged(state: string): void {
    this.elementValueChanged.emit({ id: this.elementModel.id, value: state });
  }

  ngOnDestroy(): void {
    this.widthObserver?.disconnect();
    this.widthObserver = null;
    if (this.messageListener) {
      window.removeEventListener('message', this.messageListener);
      this.messageListener = null;
    }
  }
}
