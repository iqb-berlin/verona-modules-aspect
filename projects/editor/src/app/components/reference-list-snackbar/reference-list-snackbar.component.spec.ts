import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MAT_SNACK_BAR_DATA, MatSnackBarModule, MatSnackBarRef } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { UIElement } from 'common/models/elements/element';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { ReferenceList } from 'editor/src/app/classes/reference-manager';
import {
  ReferenceListSnackbarComponent
} from 'editor/src/app/components/reference-list-snackbar/reference-list-snackbar.component';

@Component({
  selector: 'aspect-reference-list',
  standalone: false,
  template: ''
})
class MockReferenceListComponent {
  @Input() refs: ReferenceList[] | undefined;
}

describe('ReferenceListSnackbarComponent', () => {
  let component: ReferenceListSnackbarComponent;
  let fixture: ComponentFixture<ReferenceListSnackbarComponent>;
  let snackBarRef: SpyObj<MatSnackBarRef<ReferenceListSnackbarComponent>>;

  const injectedData: ReferenceList[] = [
    {
      element: { alias: 'page_1', type: 'page' },
      refs: [{ alias: 'button_1' } as unknown as UIElement]
    }
  ];

  beforeEach(async () => {
    snackBarRef = createSpyObj<MatSnackBarRef<ReferenceListSnackbarComponent>>(['dismiss']);

    await TestBed.configureTestingModule({
      declarations: [ReferenceListSnackbarComponent, MockReferenceListComponent],
      imports: [MatButtonModule, MatSnackBarModule, TranslateModule.forRoot()],
      providers: [
        { provide: MatSnackBarRef, useValue: snackBarRef },
        { provide: MAT_SNACK_BAR_DATA, useValue: injectedData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReferenceListSnackbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should hand the injected data down to the reference list', () => {
    const referenceList = fixture.debugElement.query(By.directive(MockReferenceListComponent));

    expect(referenceList.injector.get(MockReferenceListComponent).refs).toBe(injectedData);
  });

  it('should prefer the refs input over the injected data', () => {
    const ownRefs: ReferenceList[] = [
      {
        element: { alias: 'page_2', type: 'page' },
        refs: []
      }
    ];
    component.refs = ownRefs;
    fixture.detectChanges();

    const referenceList = fixture.debugElement.query(By.directive(MockReferenceListComponent));
    expect(referenceList.injector.get(MockReferenceListComponent).refs).toBe(ownRefs);
  });

  it('should dismiss the snackbar when the close button is clicked', () => {
    const closeButton: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    closeButton.click();

    expect(snackBarRef.dismiss).toHaveBeenCalled();
  });
});
