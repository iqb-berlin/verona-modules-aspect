import {
  ChangeDetectorRef, Component, ElementRef, EventEmitter,
  Input, OnDestroy, OnInit, Output, Renderer2, ViewChild
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TetfolioElement } from 'common/models/elements/tetfolio/tetfolio';
import { ValueChangeElement } from 'common/interfaces';
import { injectTetfolioBridge } from 'common/utils/tetfolio-bridge';
import { ElementComponent } from '../../directives/element-component.directive';

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

  iframeSrc: SafeResourceUrl | null = null;
  iframeHeight: number = 300;
  private blobUrl: string | null = null;
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
    this.initIframe();
    this.setupMessageListener();
  }

  /** Re-create the iframe after htmlContent has changed (used by the editor). */
  refresh(): void {
    this.releaseBlobUrl();
    this.iframeSrc = null;
    this.initIframe();
    this.changeDetectorRef.detectChanges();
  }

  private initIframe(): void {
    if (this.elementModel.htmlContent) {
      const html = injectTetfolioBridge(this.elementModel.htmlContent, this.savedState);
      const blob = new Blob([html], { type: 'text/html' });
      this.blobUrl = URL.createObjectURL(blob);
      this.iframeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(this.blobUrl);
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
  }

  private onResize(height: number): void {
    if (!height || height <= 0) return;
    this.iframeHeight = height;
    const hostEl = this.elementRef.nativeElement;
    this.renderer.setStyle(hostEl, 'height', `${height}px`);
    if (hostEl.parentElement) {
      this.renderer.setStyle(hostEl.parentElement, 'height', `${height}px`);
    }
    this.changeDetectorRef.detectChanges();
  }

  // Only emit; writing the state back into the element model is the
  // player group element's job. Doing it here would also run in the
  // editor preview and bake accidental state into the unit definition.
  private onStateChanged(state: string): void {
    this.elementValueChanged.emit({ id: this.elementModel.id, value: state });
  }

  private releaseBlobUrl(): void {
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl);
      this.blobUrl = null;
    }
  }

  ngOnDestroy(): void {
    if (this.messageListener) {
      window.removeEventListener('message', this.messageListener);
      this.messageListener = null;
    }
    this.releaseBlobUrl();
  }
}
