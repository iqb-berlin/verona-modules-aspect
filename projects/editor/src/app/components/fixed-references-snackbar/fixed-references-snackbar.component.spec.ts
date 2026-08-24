import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MAT_SNACK_BAR_DATA, MatSnackBarModule, MatSnackBarRef } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { UIElement } from 'common/models/elements/element';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import {
  FixedReferencesSnackbarComponent
} from 'editor/src/app/components/fixed-references-snackbar/fixed-references-snackbar.component';

describe('FixedReferencesSnackbarComponent', () => {
  let component: FixedReferencesSnackbarComponent;
  let fixture: ComponentFixture<FixedReferencesSnackbarComponent>;
  let snackBarRef: SpyObj<MatSnackBarRef<FixedReferencesSnackbarComponent>>;

  const injectedData: UIElement[] = [
    { type: 'drop-list', id: 'drop_list_1' } as unknown as UIElement,
    { type: 'button', id: 'button_1' } as unknown as UIElement,
    { type: 'audio', id: 'audio_1' } as unknown as UIElement,
    { type: 'text', id: 'text_1' } as unknown as UIElement
  ];

  beforeEach(async () => {
    snackBarRef = createSpyObj<MatSnackBarRef<FixedReferencesSnackbarComponent>>(['dismiss']);

    await TestBed.configureTestingModule({
      declarations: [FixedReferencesSnackbarComponent],
      imports: [
        CommonModule, MatButtonModule, MatIconModule, MatListModule, MatSnackBarModule, TranslateModule.forRoot()
      ],
      providers: [
        { provide: MatSnackBarRef, useValue: snackBarRef },
        { provide: MAT_SNACK_BAR_DATA, useValue: injectedData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FixedReferencesSnackbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render one list item per injected element', () => {
    expect(fixture.nativeElement.querySelectorAll('mat-list-item').length).toBe(4);
  });

  // Without a loader the translate pipe renders the key, so the assertion holds the type-to-key
  // mapping - the labels themselves live in assets/i18n/de.json (#1116).
  it('should label the known element types with their id', () => {
    const text: string = fixture.nativeElement.textContent;

    expect(text).toContain('toolbox.drop-list: drop_list_1');
    expect(text).toContain('toolbox.button: button_1');
    expect(text).toContain('toolbox.audio: audio_1');
  });

  it('should not label element types it does not know about', () => {
    expect(fixture.nativeElement.textContent).not.toContain('text_1');
  });

  it('should dismiss the snackbar when the close button is clicked', () => {
    const closeButton: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    closeButton.click();

    expect(snackBarRef.dismiss).toHaveBeenCalled();
  });
});
