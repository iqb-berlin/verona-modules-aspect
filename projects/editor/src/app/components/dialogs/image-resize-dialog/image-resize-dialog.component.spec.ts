import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { ImageResizeDialogData } from 'common/models/image-interfaces';
import { BytesPipe } from 'editor/src/app/pipes/bytes.pipe';
import { SupportsQualityPipe } from 'editor/src/app/pipes/supports-quality.pipe';
import {
  ImageResizeDialogComponent
} from 'editor/src/app/components/dialogs/image-resize-dialog/image-resize-dialog.component';
import {
  NumberFieldBadInputDirective
} from 'editor/modules/editor-shared/directives/number-field-bad-input.directive';
import { NumberFieldDirective } from 'editor/modules/editor-shared/directives/number-field.directive';

describe('ImageResizeDialogComponent', () => {
  let component: ImageResizeDialogComponent;
  let fixture: ComponentFixture<ImageResizeDialogComponent>;
  let mockDialogData: ImageResizeDialogData;

  beforeEach(async () => {
    mockDialogData = {
      // eslint-disable-next-line max-len
      base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      options: {
        maxWidth: 500,
        quality: 0.8
      }
    };

    await TestBed.configureTestingModule({
      declarations: [
        ImageResizeDialogComponent,
        BytesPipe,
        SupportsQualityPipe,
        NumberFieldDirective,
        NumberFieldBadInputDirective
      ],
      imports: [
        CommonModule,
        MatDialogModule,
        FormsModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        MatSliderModule,
        MatIconModule,
        MatTooltipModule,
        MatButtonModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: MatDialogRef, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ImageResizeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with provided data', () => {
    expect(component.data.options.maxWidth).toBe(500);
    expect(component.data.options.quality).toBe(0.8);
  });

  describe('SupportsQualityPipe', () => {
    let pipe: SupportsQualityPipe;

    beforeEach(() => {
      pipe = new SupportsQualityPipe();
    });

    it('should return true if targetMimeType is webp', () => {
      expect(pipe.transform('data:image/png;base64,...', 'image/webp')).toBe(true);
    });

    it('should return true for jpeg', () => {
      expect(pipe.transform('data:image/jpeg;base64,...')).toBe(true);
    });

    it('should return false for png', () => {
      expect(pipe.transform('data:image/png;base64,...')).toBe(false);
    });
  });

  it('should set original dimensions on init', () => new Promise<void>(done => {
    // The onload is async, so we wait for the image to be loaded
    setTimeout(() => {
      expect(component.originalWidth).toBe(1);
      expect(component.originalHeight).toBe(1);
      expect(component.originalSize).toBeGreaterThan(0);
      done();
    }, 200);
  }));

  it('should clamp maxWidth to the original width and sync maxHeight on init', () => new Promise<void>(done => {
    setTimeout(() => {
      expect(component.data.options.maxWidth).toBe(1);
      expect(component.data.options.maxHeight).toBe(1);
      done();
    }, 200);
  }));

  it('should always sync maxHeight to the aspect ratio when the width changes', () => {
    component.originalWidth = 200;
    component.originalHeight = 100;
    component.onWidthChange(100);
    expect(component.data.options.maxHeight).toBe(50);
  });

  it('should always sync maxWidth to the aspect ratio when the height changes', () => {
    component.originalWidth = 200;
    component.originalHeight = 100;
    component.onHeightChange(30);
    expect(component.data.options.maxWidth).toBe(60);
  });

  it('should not sync dimensions while the input is empty', () => {
    component.originalWidth = 200;
    component.originalHeight = 100;
    component.data.options.maxHeight = 75;
    component.onWidthChange(null as unknown as number);
    expect(component.data.options.maxHeight).toBe(75);
  });

  /* The two dimension boxes were bound two-way with an unenforced `min="1"`, so a 0, a negative
     number or an emptied box went into the scaling options and on to `FileService.scaleImage`,
     which is asked for an estimate on every keystroke (#1164). */
  describe('the dimension boxes', () => {
    const widthBox = (): HTMLInputElement => fixture.nativeElement
      .querySelectorAll('input[type="number"]')[0] as HTMLInputElement;

    /* `ngOnInit` loads the image and then clamps the width to it - and the fixture's image is a
       single pixel. Waiting for that to happen before setting a starting point of our own is what
       makes these deterministic; otherwise `img.onload` lands in the middle of a test and puts the
       width back to 1. */
    beforeEach(async () => {
      await new Promise<void>((resolve, reject) => {
        // Bounded on purpose: without it a decoder that never fires would hang the whole block
        // until the runner's timeout, which says nothing about what went wrong.
        let attempts = 0;
        const waitForImage = (): void => {
          attempts += 1;
          if (component.originalWidth !== 0) resolve();
          else if (attempts > 100) reject(new Error('the fixture image never loaded'));
          else setTimeout(waitForImage);
        };
        waitForImage();
      });

      component.originalWidth = 800;
      component.originalHeight = 400;
      component.data.options.maxWidth = 400;
      component.data.options.maxHeight = 200;
      fixture.detectChanges();
      await fixture.whenStable();
    });

    const edit = async (box: HTMLInputElement, value: string): Promise<void> => {
      box.value = value;
      box.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      box.dispatchEvent(new Event('blur'));
      fixture.detectChanges();
      await fixture.whenStable();
    };

    it('should take an edited width and follow it with the height', async () => {
      await edit(widthBox(), '300');

      expect(component.data.options.maxWidth).toBe(300);
      expect(component.data.options.maxHeight).toBe(150); // the aspect ratio is kept
    });

    it('should refuse a width below the minimum and put the box back', async () => {
      await edit(widthBox(), '0');

      expect(component.data.options.maxWidth).toBe(400);
      expect(component.data.options.maxHeight).toBe(200); // and the other box is left alone
      expect(widthBox().value).toBe('400');
    });

    it('should refuse an emptied width', async () => {
      await edit(widthBox(), '');

      expect(component.data.options.maxWidth).toBe(400);
      expect(widthBox().value).toBe('400');
    });
  });
});
