import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ImageFullscreenDialog } from './image-fullscreen-dialog.component';

describe('ImageFullscreenDialog', () => {
  let component: ImageFullscreenDialog;
  let fixture: ComponentFixture<ImageFullscreenDialog>;
  const dialogRefMock: Pick<MatDialogRef<ImageFullscreenDialog>, 'close'> = {
    close: vi.fn()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImageFullscreenDialog],
      imports: [MatDialogModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { src: 'assets/test-image.png', alt: 'Testbild' } },
        { provide: MatDialogRef, useValue: dialogRefMock }
      ]
    }).compileComponents();

    vi.mocked(dialogRefMock.close).mockClear();
    fixture = TestBed.createComponent(ImageFullscreenDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the image with the given src and alt text', () => {
    const image: HTMLImageElement = fixture.nativeElement.querySelector('img');
    expect(image).toBeTruthy();
    expect(image.getAttribute('src')).toBe('assets/test-image.png');
    expect(image.getAttribute('alt')).toBe('Testbild');
  });

  it('should close the dialog on content click', () => {
    const content: HTMLElement = fixture.nativeElement.querySelector('mat-dialog-content');
    content.click();
    expect(dialogRefMock.close).toHaveBeenCalled();
  });
});
