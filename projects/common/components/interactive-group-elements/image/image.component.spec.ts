import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Directive, Input } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { ImageElement, ImageProperties } from 'common/models/elements/interactive-group-elements/image';
import { SafeResourceUrlPipe } from 'common/pipes/safe-resource-url.pipe';
import { ImageMagnifierComponent } from '../image-magnifier/image-magnifier.component';
import { ImageComponent } from './image.component';

@Directive({
  selector: '[imageFullscreen]',
  standalone: false
})
class MockImageFullscreenDirective {
  @Input() imgSrc!: SafeResourceUrl;
  @Input() allowFullscreen!: boolean;
}

describe('ImageComponent', () => {
  let component: ImageComponent;
  let fixture: ComponentFixture<ImageComponent>;

  const imageSrc = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ImageComponent,
        ImageMagnifierComponent,
        MockImageFullscreenDirective,
        SafeResourceUrlPipe
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageComponent);
    component = fixture.componentInstance;
    component.elementModel = new ImageElement({
      type: 'image',
      id: 'test-id',
      alias: 'test-alias',
      src: imageSrc,
      alt: 'Test image',
      scale: false,
      allowFullscreen: false,
      magnifier: false,
      magnifierSize: 100,
      magnifierZoom: 2,
      magnifierUsed: false,
      fileName: 'test.gif'
    } as Partial<ImageProperties>);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the image when src is set', () => {
    const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    expect(image).not.toBeNull();
    expect(image.alt).toBe('Test image');
    expect(image.getAttribute('src')).toBe(imageSrc);
  });

  it('should not render the image container when src is null', () => {
    component.elementModel.src = null;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.image-container')).toBeNull();
  });

  it('should toggle magnifierVisible on mouseenter and mouseleave', () => {
    const container = fixture.nativeElement.querySelector('.image-container') as HTMLDivElement;
    container.dispatchEvent(new Event('mouseenter'));
    expect(component.magnifierVisible).toBe(true);
    container.dispatchEvent(new Event('mouseleave'));
    expect(component.magnifierVisible).toBe(false);
  });

  it('should show the magnifier when activated and hovered', () => {
    expect(fixture.nativeElement.querySelector('aspect-image-magnifier')).toBeNull();
    component.elementModel.magnifier = true;
    component.magnifierVisible = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('aspect-image-magnifier')).not.toBeNull();
  });

  it('should forward elementValueChanged from the magnifier', () => {
    component.elementModel.magnifier = true;
    component.magnifierVisible = true;
    fixture.detectChanges();
    const emitSpy = vi.spyOn(component.elementValueChanged, 'emit');
    const magnifier = fixture.debugElement
      .query(element => element.componentInstance instanceof ImageMagnifierComponent)
      .componentInstance as ImageMagnifierComponent;
    magnifier.elementValueChanged.emit({ id: 'test-id', value: true });
    expect(emitSpy).toHaveBeenCalledWith({ id: 'test-id', value: true });
  });
});
