import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MAT_SNACK_BAR_DATA, MatSnackBarModule, MatSnackBarRef } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { UIElement } from 'common/models/elements/element';
import { UIElementProperties } from 'common/models/ui-element-interfaces';
import { ElementFactory } from 'common/utils/element-factory';
import { Section } from 'common/models/section';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { ReferenceRepair } from 'editor/src/app/classes/reference-manager';
import { ElementListComponent } from 'editor/src/app/components/element-list/element-list.component';
import {
  FixedReferencesSnackbarComponent
} from 'editor/src/app/components/fixed-references-snackbar/fixed-references-snackbar.component';

describe('FixedReferencesSnackbarComponent', () => {
  let fixture: ComponentFixture<FixedReferencesSnackbarComponent>;
  let snackBarRef: SpyObj<MatSnackBarRef<FixedReferencesSnackbarComponent>>;

  const element = (type: string, alias: string): UIElement => ElementFactory
    .createElement({ type, id: `${type}_1`, alias } as unknown as UIElementProperties);

  const create = (repair: ReferenceRepair): void => {
    TestBed.overrideProvider(MAT_SNACK_BAR_DATA, { useValue: repair });
    fixture = TestBed.createComponent(FixedReferencesSnackbarComponent);
    fixture.detectChanges();
  };
  const text = (): string => fixture.nativeElement.textContent;

  beforeEach(async () => {
    snackBarRef = createSpyObj<MatSnackBarRef<FixedReferencesSnackbarComponent>>(['dismiss']);

    await TestBed.configureTestingModule({
      declarations: [FixedReferencesSnackbarComponent, ElementListComponent],
      imports: [
        CommonModule, MatButtonModule, MatIconModule, MatListModule, MatSnackBarModule, TranslateModule.forRoot()
      ],
      providers: [
        { provide: MatSnackBarRef, useValue: snackBarRef },
        { provide: MAT_SNACK_BAR_DATA, useValue: { repaired: [], toCheck: [] } }
      ]
    });
  });

  /* It listed three types by hand and left out every other one, video among them (#1509). */
  it('should list every repaired element by its type and alias', () => {
    create({
      repaired: [element('drop-list', 'liste'), element('video', 'film'), element('text', 'lesetext'),
        element('trigger', 'ausloeser')],
      toCheck: []
    });

    expect(fixture.nativeElement.querySelectorAll('aspect-element-list mat-list-item').length).toBe(4);
    expect(text()).toContain('Video: film');
    expect(text()).toContain('Auslöser: ausloeser');
    expect(text()).toContain('invalidReferencesRemoved');
    expect(text()).not.toContain('invalidVisibilityRulesToCheck');
  });

  /* Rules into nothing are not removed on load, as that would change what test takers see (#1509). */
  it('should list the sections whose visibility rules were left for the author to check', () => {
    create({ repaired: [], toCheck: [{ section: new Section(), pageIndex: 1, sectionIndex: 0 }] });

    expect(fixture.nativeElement.querySelectorAll('.section-to-check').length).toBe(1);
    expect(text()).toContain('invalidVisibilityRulesToCheck');
    expect(text()).toContain('referenceList.sectionLocation');
    expect(text()).not.toContain('invalidReferencesRemoved');
  });

  it('should dismiss the snackbar when the close button is clicked', () => {
    create({ repaired: [element('audio', 'ton')], toCheck: [] });

    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();

    expect(snackBarRef.dismiss).toHaveBeenCalled();
  });
});
