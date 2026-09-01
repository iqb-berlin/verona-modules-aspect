import {
  ComponentFixture, TestBed, fakeAsync, tick
} from '@angular/core/testing';
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
import { FileService } from 'common/services/file.service';
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

  /* Two notices that only some callers get. Both are decided by the data the dialog was opened with,
     so they are the one thing a spec on the dialog itself can pin (#1378, #1399). */
  describe('the notices for an image that is already in the unit', () => {
    const hint = () => fixture.nativeElement.querySelector('.recompression-hint');
    const warning = () => fixture.nativeElement.querySelector('.fixed-overlays-warning');

    it('should say nothing about a second pass on the way in', () => {
      expect(hint()).toBeNull();
    });

    it('should say what a second pass costs for an image that is already there', () => {
      component.data.isEmbedded = true;
      fixture.detectChanges();

      expect(hint()).not.toBeNull();
    });

    // The hotspots only matter once the picture would actually get smaller.
    it('should warn about pinned hotspots as soon as the image would shrink', () => {
      component.data.hasFixedOverlays = true;
      component.willResize = true;
      fixture.detectChanges();

      expect(warning()).not.toBeNull();
    });

    it('should keep the warning away while only the quality changes', () => {
      component.data.hasFixedOverlays = true;
      component.willResize = false;
      fixture.detectChanges();

      expect(warning()).toBeNull();
    });

    it('should keep the warning away for an element without hotspots', () => {
      component.willResize = true;
      fixture.detectChanges();

      expect(warning()).toBeNull();
    });
  });

  /* The flag is read synchronously at the start of `updateEstimatedSize`, and it is read here before
     the promise is awaited on purpose: `ngOnInit` loads the image in the background and writes the
     original dimensions when it is done, which would otherwise land in the middle of the test. */
  describe('willResize', () => {
    const decide = (options: { maxWidth: number; maxHeight?: number; uncompressed?: boolean }): boolean => {
      component.originalWidth = 400;
      component.originalHeight = 200;
      component.data.options.maxWidth = options.maxWidth;
      component.data.options.maxHeight = options.maxHeight ?? 200;
      component.data.options.uncompressed = options.uncompressed;
      component.updateEstimatedSize();
      return component.willResize;
    };

    it('should be true when the chosen width is below the original', () => {
      expect(decide({ maxWidth: 300 })).toBe(true);
    });

    it('should be false when the width is left at the original', () => {
      expect(decide({ maxWidth: 400 })).toBe(false);
    });

    /* `scaleImage` scales on either axis, and the height box writes the width back through the
       aspect ratio - for a tall image that rounding can land on the original width again, and a
       width-only comparison would then miss a picture that does get smaller. */
    it('should be true when only the height is below the original', () => {
      expect(decide({ maxWidth: 400, maxHeight: 190 })).toBe(true);
    });

    /* "Originaldatei verwenden" hands the image back untouched, so nothing moves whatever the boxes
       say. */
    it('should be false while the original file is kept', () => {
      expect(decide({ maxWidth: 300, uncompressed: true })).toBe(false);
    });
  });

  /* Green reads as a saving. Since an image that is already in the unit is re-encoded from the
     start, the result can just as well be bigger, and the readout has to say which way it went. */
  describe('the estimated size', () => {
    const readout = () => fixture.nativeElement.querySelector('.estimated-size');

    it('should mark a result that is bigger than what is there now', () => {
      component.originalSize = 1000;
      component.estimatedSize = 1500;
      fixture.detectChanges();

      expect(readout().classList).toContain('estimated-size-larger');
      expect(readout().textContent).toContain('newSizeLarger');
    });

    it('should leave a saving unmarked', () => {
      component.originalSize = 1000;
      component.estimatedSize = 400;
      fixture.detectChanges();

      expect(readout().classList).not.toContain('estimated-size-larger');
      expect(readout().textContent).not.toContain('newSizeLarger');
    });
  });

  /* Scaling the image is what the estimate costs, and where the browser reads the whole picture that
     is around 90 ms of the main thread. Typing a width is a burst of those, and only the last one is
     ever read (#1434). */
  describe('the estimate', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    /* The widths are taken down as the calls come in rather than read off the recorded arguments
       afterwards: those hold the options object itself, which the dialog keeps editing in place. */
    it('should scale once for a burst of edits, with the last of them', fakeAsync(() => {
      const scaled: (number | undefined)[] = [];
      vi.spyOn(FileService, 'scaleImage').mockImplementation((base64, options) => {
        scaled.push(options?.maxWidth);
        return Promise.resolve('data:image/png;base64,abcd');
      });
      component.originalWidth = 800;
      component.originalHeight = 400;

      [500, 400, 300].forEach(width => {
        component.data.options.maxWidth = width;
        component.updateEstimatedSize();
      });
      tick(300);

      expect(scaled).toEqual([300]);
    }));

    it('should mark the figure as stale until the scaling has answered', fakeAsync(() => {
      vi.spyOn(FileService, 'scaleImage').mockResolvedValue('data:image/png;base64,abcd');

      component.updateEstimatedSize();
      expect(component.estimatePending).toBe(true);

      tick(300);
      expect(component.estimatePending).toBe(false);
    }));

    it('should not scale before the typing has come to rest', fakeAsync(() => {
      const scaling = vi.spyOn(FileService, 'scaleImage')
        .mockResolvedValue('data:image/png;base64,abcd');

      component.updateEstimatedSize();
      tick(299);
      expect(scaling).not.toHaveBeenCalled();

      tick(1);
      expect(scaling).toHaveBeenCalledTimes(1);
    }));
  });

  /* There is nothing to set here: the browser either reads the whole picture while shrinking it or
     it does not, and where it does not, saying so is all the dialog can do (#1434). */
  describe('the notice about a coarse browser', () => {
    const notice = () => fixture.nativeElement.querySelector('.resampling-hint');

    it('should say nothing while the browser reads the whole picture', () => {
      component.coarseResampling = false;
      component.willResize = true;
      fixture.detectChanges();

      expect(notice()).toBeNull();
    });

    it('should say so once a coarse browser would actually shrink the image', () => {
      component.coarseResampling = true;
      component.willResize = true;
      fixture.detectChanges();

      expect(notice()).not.toBeNull();
    });

    // Compressing at the same size hands every pixel through, coarse browser or not.
    it('should stay away while only the quality changes', () => {
      component.coarseResampling = true;
      component.willResize = false;
      fixture.detectChanges();

      expect(notice()).toBeNull();
    });
  });

  /* Until the slider is moved, the quality is the dialog's own default rather than a decision, and
     re-encoding on it would put every confirmed upload through the canvas (#1398). */
  it('should not ask for a re-encode before the quality slider is touched', () => {
    expect(component.data.options.recompress).toBeUndefined();
  });

  it('should ask for a re-encode once the quality slider is moved', () => {
    component.onQualityChange();

    expect(component.data.options.recompress).toBe(true);
  });
});
