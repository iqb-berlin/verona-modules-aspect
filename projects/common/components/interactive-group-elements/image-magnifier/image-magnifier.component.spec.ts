import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageMagnifierComponent } from './image-magnifier.component';

describe('ImageMagnifierComponent', () => {
  let component: ImageMagnifierComponent;
  let fixture: ComponentFixture<ImageMagnifierComponent>;

  const createImage = (width: number, height: number): HTMLImageElement => {
    const image = document.createElement('img');
    Object.defineProperty(image, 'width', { value: width });
    Object.defineProperty(image, 'height', { value: height });
    return image;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImageMagnifierComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageMagnifierComponent);
    component = fixture.componentInstance;
    component.image = createImage(100, 100);
    component.imageId = 'test-id';
    component.zoom = 2;
    component.size = 20;
    component.used = false;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit elementValueChanged on first mousemove only', () => {
    const emitSpy = vi.spyOn(component.elementValueChanged, 'emit');
    component.onMousemove({ offsetX: 10, offsetY: 10 } as MouseEvent);
    expect(component.used).toBe(true);
    expect(emitSpy).toHaveBeenCalledWith({ id: 'test-id', value: true });
    component.onMousemove({ offsetX: 20, offsetY: 20 } as MouseEvent);
    expect(emitSpy).toHaveBeenCalledTimes(1);
  });

  it('should calculate glass position on mousemove', () => {
    component.onMousemove({ offsetX: 50, offsetY: 50 } as MouseEvent);
    // ((100 - 20) / 100) * 50 - 2 = 38
    expect(component.left).toBe(38);
    expect(component.top).toBe(38);
  });

  it('should calculate background position on mousemove', () => {
    component.onMousemove({ offsetX: 50, offsetY: 50 } as MouseEvent);
    // 50 * 2 - (50 / 100) * 20 = 90
    expect(component.backgroundPosition).toBe('-90px -90px');
  });

  it('should size the magnifier glass according to the size input', () => {
    component.onMousemove({ offsetX: 50, offsetY: 50 } as MouseEvent);
    fixture.detectChanges();
    const glass = fixture.nativeElement.querySelector('.magnifier-glass') as HTMLDivElement;
    expect(glass.style.width).toBe('20px');
    expect(glass.style.height).toBe('20px');
    expect(glass.style.backgroundSize).toBe('200px 200px');
  });
});
