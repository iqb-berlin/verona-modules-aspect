import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { Mock } from 'vitest';
import { VisibilityRule } from 'common/models/visibility-rule';
import {
  VisibilityRuleEditorComponent
} from 'editor/src/app/components/dialogs/visibility-rule-editor/visibility-rule-editor.component';
import {
  VisibilityRulesDialogComponent
} from 'editor/src/app/components/dialogs/visibility-rules-dialog/visibility-rules-dialog.component';

describe('VisibilityRulesDialogComponent', () => {
  let component: VisibilityRulesDialogComponent;
  let fixture: ComponentFixture<VisibilityRulesDialogComponent>;
  let dialogRefMock: { close: Mock };
  let visibilityRules: VisibilityRule[];

  const configureTestBed = async (data: {
    visibilityRules: VisibilityRule[],
    logicalConnectiveOfRules: 'disjunction' | 'conjunction',
    visibilityDelay: number,
    animatedVisibility: boolean,
    controlIds: { id: string, alias: string }[],
    enableReHide: boolean
  }): Promise<void> => {
    dialogRefMock = { close: vi.fn() };
    await TestBed.configureTestingModule({
      declarations: [
        VisibilityRulesDialogComponent,
        VisibilityRuleEditorComponent
      ],
      imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatRadioModule,
        MatSelectModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: dialogRefMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VisibilityRulesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  const getActionButtons = (): HTMLButtonElement[] => Array
    .from(fixture.nativeElement.querySelectorAll('.mat-mdc-dialog-actions button') as NodeListOf<HTMLButtonElement>);

  describe('with control ids', () => {
    beforeEach(async () => {
      visibilityRules = [{ id: 'checkbox_1', operator: '=', value: 'true' }];
      await configureTestBed({
        visibilityRules,
        logicalConnectiveOfRules: 'conjunction',
        visibilityDelay: 500,
        animatedVisibility: true,
        controlIds: [{ id: 'checkbox_1', alias: 'Kontrollkästchen' }],
        enableReHide: false
      });
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize from the injected data with a detached rules array', () => {
      expect(component.visibilityRules).toEqual(visibilityRules);
      expect(component.visibilityRules).not.toBe(visibilityRules);
      expect(component.logicalConnectiveOfRules).toBe('conjunction');
      expect(component.visibilityDelay).toBe(500);
      expect(component.animatedVisibility).toBe(true);
      expect(component.enableReHide).toBe(false);
      expect(component.controlIds.length).toBe(1);
    });

    it('should render one rule editor per rule', () => {
      expect(fixture.nativeElement.querySelectorAll('aspect-visibility-rule-editor').length).toBe(1);

      component.addVisibilityRule();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelectorAll('aspect-visibility-rule-editor').length).toBe(2);
    });

    it('should add an empty rule without touching the injected array', () => {
      component.addVisibilityRule();

      expect(component.visibilityRules[1]).toEqual({ id: '', operator: '=', value: '' });
      expect(visibilityRules.length).toBe(1);
    });

    it('should delete the rule of the given index', () => {
      component.addVisibilityRule();

      component.deleteVisibilityRule(0);

      expect(component.visibilityRules).toEqual([{ id: '', operator: '=', value: '' }]);
    });

    it('should close with all edited visibility settings', () => {
      component.logicalConnectiveOfRules = 'disjunction';
      component.enableReHide = true;
      fixture.detectChanges();

      getActionButtons()[0].click();

      expect(dialogRefMock.close).toHaveBeenCalledWith({
        visibilityRules: component.visibilityRules,
        logicalConnectiveOfRules: 'disjunction',
        visibilityDelay: 500,
        animatedVisibility: true,
        enableReHide: true
      });
    });
  });

  describe('without control ids', () => {
    beforeEach(async () => {
      await configureTestBed({
        visibilityRules: [],
        logicalConnectiveOfRules: 'disjunction',
        visibilityDelay: 0,
        animatedVisibility: false,
        controlIds: [],
        enableReHide: false
      });
    });

    it('should ask for elements or state variables instead of offering rules', () => {
      expect(fixture.nativeElement.querySelector('p').textContent)
        .toContain('section.addElementsOrStateVariables');
      expect(fixture.nativeElement.querySelector('.add-button')).toBeNull();
    });

    it('should only offer the cancel button', () => {
      expect(getActionButtons().length).toBe(1);

      getActionButtons()[0].click();

      expect(dialogRefMock.close).toHaveBeenCalledTimes(1);
      expect(dialogRefMock.close.mock.lastCall?.[0]).toBeFalsy();
    });
  });
});
