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
import { BytesPipe } from '../../pipes/bytes.pipe';
import { SupportsQualityPipe } from '../../pipes/supports-quality.pipe';
import { ImageResizeDialogComponent } from './image-resize-dialog.component';

describe('ImageResizeDialogComponent', () => {
  let component: ImageResizeDialogComponent;
  let fixture: ComponentFixture<ImageResizeDialogComponent>;

  const mockDialogData = {
    // eslint-disable-next-line max-len
    base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    options: {
      maxWidth: 500,
      quality: 0.8
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ImageResizeDialogComponent,
        BytesPipe,
        SupportsQualityPipe
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
      expect(pipe.transform('data:image/png;base64,...', 'image/webp')).toBeTrue();
    });

    it('should return true for jpeg', () => {
      expect(pipe.transform('data:image/jpeg;base64,...')).toBeTrue();
    });

    it('should return false for png', () => {
      expect(pipe.transform('data:image/png;base64,...')).toBeFalse();
    });
  });

  it('should set original dimensions on init', done => {
    // The onload is async, so we wait for the image to be loaded
    setTimeout(() => {
      expect(component.originalWidth).toBe(1);
      expect(component.originalHeight).toBe(1);
      expect(component.originalSize).toBeGreaterThan(0);
      done();
    }, 200);
  });
});
