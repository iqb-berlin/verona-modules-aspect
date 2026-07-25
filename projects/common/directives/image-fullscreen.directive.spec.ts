import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import {
  ImageFullscreenDialog
} from 'common/components/image-fullscreen-dialog/image-fullscreen-dialog.component';
import { ImageFullscreenDirective } from './image-fullscreen.directive';

// The inputs are set on the directive instance: property bindings on native
// elements in spec-local host templates are rejected by the AOT compiler (NG8002).
@Component({
  template: '<img imageFullscreen alt="alt text">',
  standalone: false
})
class TestHostComponent {}

describe('ImageFullscreenDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let directive: ImageFullscreenDirective;
  let image: HTMLImageElement;
  let matDialog: SpyObj<MatDialog>;

  beforeEach(async () => {
    matDialog = createSpyObj<MatDialog>(['open']);
    await TestBed.configureTestingModule({
      declarations: [TestHostComponent, ImageFullscreenDirective],
      providers: [{ provide: MatDialog, useValue: matDialog }]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    directive = fixture.debugElement.query(By.directive(ImageFullscreenDirective))
      .injector.get(ImageFullscreenDirective);
    directive.imgSrc = 'assets/image.png';
    directive.allowFullscreen = true;
    directive.alt = 'alt text';
    fixture.detectChanges();
    image = fixture.nativeElement.querySelector('img');
  });

  it('should open the fullscreen dialog with image source and alt text on click', () => {
    image.click();
    expect(matDialog.open).toHaveBeenCalledTimes(1);
    expect(matDialog.open).toHaveBeenCalledWith(ImageFullscreenDialog, {
      data: { src: 'assets/image.png', alt: 'alt text' },
      panelClass: 'image-fullscreen-dialog'
    });
  });

  it('should not open the dialog when fullscreen is not allowed', () => {
    directive.allowFullscreen = false;
    image.click();
    expect(matDialog.open).not.toHaveBeenCalled();
  });
});
