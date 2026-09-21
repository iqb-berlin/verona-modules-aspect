import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from 'common/environment';
import { TetfolioElement } from 'common/models/elements/tetfolio';
import { TetfolioComponent } from './tetfolio.component';

describe('TetfolioComponent', () => {
  let component: TetfolioComponent;
  let fixture: ComponentFixture<TetfolioComponent>;

  const createComponent = (htmlContent: string): void => {
    fixture = TestBed.createComponent(TetfolioComponent);
    component = fixture.componentInstance;
    component.elementModel = new TetfolioElement({
      type: 'tetfolio',
      id: 'tetfolio_1',
      alias: 'tetfolio_1',
      htmlContent
    });
    fixture.detectChanges();
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
    expect(component.iframeSrc).toBeNull();
    const placeholder = fixture.nativeElement.querySelector('.tetfolio-placeholder');
    expect(placeholder).toBeTruthy();
    expect(fixture.nativeElement.querySelector('iframe')).toBeNull();
  });

  it('should render an iframe from a blob URL when content is set', () => {
    createComponent('<html><body><p>unit</p></body></html>');
    expect(component.iframeSrc).not.toBeNull();
    expect(fixture.nativeElement.querySelector('iframe')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.tetfolio-placeholder')).toBeNull();
  });

  it('should release the old blob URL and build a new one on refresh', () => {
    createComponent('<html><body></body></html>');
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL');
    const createSpy = vi.spyOn(URL, 'createObjectURL');
    component.refresh();
    expect(revokeSpy).toHaveBeenCalledTimes(1);
    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(component.iframeSrc).not.toBeNull();
  });

  it('should release the blob URL and the message listener on destroy', () => {
    const createSpy = vi.spyOn(URL, 'createObjectURL');
    createComponent('<html><body></body></html>');
    const ownBlobUrl = createSpy.mock.results[0].value as string;
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL');
    const removeListenerSpy = vi.spyOn(window, 'removeEventListener');
    fixture.destroy();
    expect(revokeSpy).toHaveBeenCalledWith(ownBlobUrl);
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
});
