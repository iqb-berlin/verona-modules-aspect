import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from 'common/environment';
import { TetfolioElement } from 'common/models/elements/tetfolio';
import { DimensionProperties } from 'common/models/elements/property-group-interfaces';
import { TetfolioComponent } from './tetfolio.component';

describe('TetfolioComponent', () => {
  let component: TetfolioComponent;
  let fixture: ComponentFixture<TetfolioComponent>;

  const createComponent = (htmlContent: string, dimensions: Partial<DimensionProperties> = {}): void => {
    fixture = TestBed.createComponent(TetfolioComponent);
    component = fixture.componentInstance;
    component.elementModel = new TetfolioElement({
      type: 'tetfolio',
      id: 'tetfolio_1',
      alias: 'tetfolio_1',
      htmlContent
    });
    Object.assign(component.elementModel.dimensions, dimensions);
    fixture.detectChanges();
  };

  /** A resize/state message the component accepts: its source must be the own iframe's window. */
  const dispatchIframeMessage = (data: Record<string, unknown>): void => {
    const iframe = fixture.nativeElement.querySelector('iframe') as HTMLIFrameElement;
    window.dispatchEvent(new MessageEvent('message', { data, source: iframe.contentWindow }));
  };

  beforeEach(async () => {
    environment.strictInstantiation = false;
    await TestBed.configureTestingModule({
      declarations: [TetfolioComponent],
      imports: [TranslateModule.forRoot()]
    }).compileComponents();
  });

  it('should create', () => {
    createComponent('');
    expect(component).toBeTruthy();
  });

  it('should show the placeholder and no iframe without content', () => {
    createComponent('');
    expect(component.iframeContent).toBeNull();
    const placeholder = fixture.nativeElement.querySelector('.tetfolio-placeholder');
    expect(placeholder).toBeTruthy();
    expect(fixture.nativeElement.querySelector('iframe')).toBeNull();
  });

  it('should hand the content to the iframe via srcdoc, with the bridge spliced in', () => {
    createComponent('<html><body><p>unit</p></body></html>');
    const iframe = fixture.nativeElement.querySelector('iframe') as HTMLIFrameElement;
    expect(iframe).toBeTruthy();
    expect(iframe.srcdoc).toContain('<p>unit</p>');
    expect(iframe.srcdoc).toContain('tetfolioStateChanged');
    expect(fixture.nativeElement.querySelector('.tetfolio-placeholder')).toBeNull();
  });

  /* A host policy of `frame-src 'self'` - the Testcenter's - refuses `blob:` frames. */
  it('should not load the iframe from a blob URL', () => {
    const createSpy = vi.spyOn(URL, 'createObjectURL');
    createComponent('<html><body></body></html>');
    const iframe = fixture.nativeElement.querySelector('iframe') as HTMLIFrameElement;
    expect(createSpy).not.toHaveBeenCalled();
    expect(iframe.getAttribute('src')).toBeNull();
  });

  it('should build a new iframe with the changed content on refresh', () => {
    createComponent('<html><body><p>old</p></body></html>');
    const oldIframe = fixture.nativeElement.querySelector('iframe') as HTMLIFrameElement;
    component.elementModel.htmlContent = '<html><body><p>new</p></body></html>';
    component.refresh();
    const newIframe = fixture.nativeElement.querySelector('iframe') as HTMLIFrameElement;
    expect(newIframe).not.toBe(oldIframe);
    expect(newIframe.srcdoc).toContain('<p>new</p>');
  });

  it('should build a new iframe on refresh even when the content is unchanged', () => {
    createComponent('<html><body><p>same</p></body></html>');
    const oldIframe = fixture.nativeElement.querySelector('iframe') as HTMLIFrameElement;
    component.refresh();
    expect(fixture.nativeElement.querySelector('iframe')).not.toBe(oldIframe);
  });

  it('should release the message listener on destroy', () => {
    createComponent('<html><body></body></html>');
    const removeListenerSpy = vi.spyOn(window, 'removeEventListener');
    fixture.destroy();
    expect(removeListenerSpy).toHaveBeenCalledWith('message', expect.any(Function));
  });

  it('should ignore messages that are not from its own iframe', () => {
    createComponent('<html><body></body></html>');
    const emitSpy = vi.spyOn(component.elementValueChanged, 'emit');
    window.dispatchEvent(new MessageEvent('message', {
      data: { type: 'tetfolioStateChanged', state: '{}' }
    }));
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should emit the reported state for a message from its own iframe', () => {
    createComponent('<html><body></body></html>');
    const emitSpy = vi.spyOn(component.elementValueChanged, 'emit');
    dispatchIframeMessage({ type: 'tetfolioStateChanged', state: '{"key":"value"}' });
    expect(emitSpy).toHaveBeenCalledWith({ id: 'tetfolio_1', value: '{"key":"value"}' });
  });

  it('should start with the authored height from the model', () => {
    createComponent('<html><body></body></html>', { height: 250 });
    expect(component.iframeHeight).toBe(250);
  });

  it('should follow the content height reported by the iframe', () => {
    createComponent('<html><body></body></html>', { height: 250 });
    dispatchIframeMessage({ type: 'tetfolioResize', height: 620 });
    expect(component.iframeHeight).toBe(620);
  });

  it('should clamp the content height to the authored bounds', () => {
    createComponent('<html><body></body></html>', { height: 250, minHeight: 200, maxHeight: 500 });
    dispatchIframeMessage({ type: 'tetfolioResize', height: 620 });
    expect(component.iframeHeight).toBe(500);
    dispatchIframeMessage({ type: 'tetfolioResize', height: 100 });
    expect(component.iframeHeight).toBe(200);
  });

  it('should keep a fixed height regardless of the content height', () => {
    createComponent('<html><body></body></html>', { height: 250, isHeightFixed: true });
    dispatchIframeMessage({ type: 'tetfolioResize', height: 620 });
    expect(component.iframeHeight).toBe(250);
  });
});
