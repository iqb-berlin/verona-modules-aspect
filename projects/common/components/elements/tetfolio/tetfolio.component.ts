import {
  ChangeDetectorRef, Component, ElementRef, EventEmitter,
  Input, OnDestroy, OnInit, Output, Renderer2, ViewChild
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TetfolioElement } from 'common/models/elements/tetfolio';
import { ValueChangeElement } from 'common/models/input-element-interfaces';
import { injectTetfolioBridge } from 'common/utils/tetfolio-bridge';
import { ElementComponent } from 'common/directives/element-component.directive';
import { BehaviorSubject } from 'rxjs';

/** Renders a tetfolio element's packed HTML document in an iframe and relays the resize and
   state messages the embedded app posts back over the bridge. The document is handed over via
   `srcdoc`, not a blob URL: hosts like the Testcenter run the player under the policy
   `frame-src 'self'`, which refuses `blob:` frames and lets `srcdoc` pass. The iframe is NOT
   sandboxed - a srcdoc document shares the player's origin, and the bridge relies on that
   (storage, postMessage source checks). The content is design-time author content, the same
   trust level as the rest of the unit definition; see docs/tetfolio-element.md. */
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
  iframeHeight: number = 300;
  /** False while a saved state is being restored inside the iframe; drives the overlay and
     the spinner, the same way geometry and the media players use it. */
  isLoaded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private messageListener: ((event: MessageEvent) => void) | null = null;

  constructor(
    elementRef: ElementRef,
    private sanitizer: DomSanitizer,
    private renderer: Renderer2,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super(elementRef);
  }

  ngOnInit(): void {
    this.iframeHeight = this.elementModel.dimensions.height;
    this.initIframe();
    this.setupMessageListener();
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
    if (this.elementModel.htmlContent) {
      const html = injectTetfolioBridge(this.elementModel.htmlContent, this.savedState, this.elementModel.id);
      this.iframeContent = this.sanitizer.bypassSecurityTrustHtml(html);
    }
  }

  private setupMessageListener(): void {
    this.messageListener = (event: MessageEvent) => this.handleMessage(event);
    window.addEventListener('message', this.messageListener);
  }

  private handleMessage(event: MessageEvent): void {
    if (!this.tetfolioIframe?.nativeElement?.contentWindow) return;
    if (event.source !== this.tetfolioIframe.nativeElement.contentWindow) return;
    if (event.data?.type === 'tetfolioResize') {
      this.onResize(event.data.height);
    }
    if (event.data?.type === 'tetfolioStateChanged') {
      this.onStateChanged(event.data.state);
    }
    if (event.data?.type === 'tetfolioReady') {
      this.isLoaded.next(true);
    }
  }

  // The authored dimensions govern how far the iframe follows its content:
  // a fixed height ignores the content's size entirely (it scrolls inside),
  // otherwise the reported height is clamped to the min/max bounds. The
  // panel's height value is the initial height until the first report.
  private onResize(height: number): void {
    if (!height || height <= 0) return;
    const { isHeightFixed, minHeight, maxHeight } = this.elementModel.dimensions;
    if (isHeightFixed) return;
    const boundedHeight = Math.min(
      Math.max(height, minHeight ?? 0),
      maxHeight ?? Number.MAX_SAFE_INTEGER
    );
    this.iframeHeight = boundedHeight;
    const hostEl = this.elementRef.nativeElement;
    this.renderer.setStyle(hostEl, 'height', `${boundedHeight}px`);
    if (hostEl.parentElement) {
      this.renderer.setStyle(hostEl.parentElement, 'height', `${boundedHeight}px`);
    }
    this.changeDetectorRef.detectChanges();
  }

  // Only emit; writing the state back into the element model is the
  // player group element's job. Doing it here would also run in the
  // editor preview and bake accidental state into the unit definition.
  private onStateChanged(state: string): void {
    this.elementValueChanged.emit({ id: this.elementModel.id, value: state });
  }

  ngOnDestroy(): void {
    if (this.messageListener) {
      window.removeEventListener('message', this.messageListener);
      this.messageListener = null;
    }
  }
}
