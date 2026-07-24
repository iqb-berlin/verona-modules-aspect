import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { HasTextContentPipe } from 'common/pipes/has-text-content.pipe';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { TooltipPropertiesDialogComponent } from 'editor/src/app/components/dialogs/tooltip-properties-dialog/tooltip-properties-dialog.component';

@Component({
  selector: 'aspect-rich-text-editor',
  template: '',
  standalone: false
})
class MockRichTextEditorComponent {
  @Input() content!: string | Record<string, unknown>;
  @Input() showReducedControls: boolean = false;
  @Input() controlPanelFolded: boolean = false;
  @Input() autoFocus: boolean = false;
  @Output() contentChange = new EventEmitter<string>();
}

describe('TooltipPropertiesDialogComponent', () => {
  let component: TooltipPropertiesDialogComponent;
  let fixture: ComponentFixture<TooltipPropertiesDialogComponent>;

  const configureTestBed = async (
    dialogData: { tooltipText: string | undefined, tooltipPosition: string | undefined }
  ): Promise<void> => {
    await TestBed.configureTestingModule({
      declarations: [
        TooltipPropertiesDialogComponent,
        MockRichTextEditorComponent,
        HasTextContentPipe
      ],
      imports: [
        CommonModule,
        MatDialogModule,
        FormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: MatDialogRef, useValue: {} },
        { provide: DialogService, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TooltipPropertiesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  const getSaveButton = (): HTMLButtonElement | null => Array
    .from(fixture.nativeElement.querySelectorAll('mat-dialog-actions button') as NodeListOf<HTMLButtonElement>)
    .find(button => button.textContent?.includes('save')) || null;

  describe('with a new tooltip', () => {
    beforeEach(async () => {
      await configureTestBed({ tooltipText: undefined, tooltipPosition: undefined });
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with defaults and without delete button', () => {
      expect(component.tooltipText).toBe('');
      expect(component.tooltipPosition).toBe('below');
      expect(component.newTooltip).toBe(true);
      const buttons = fixture.nativeElement.querySelectorAll('mat-dialog-actions button');
      expect(buttons.length).toBe(2);
    });

    it('should disable save button while tooltip text is empty', () => {
      expect(getSaveButton()?.disabled).toBe(true);
    });

    it('should keep save button disabled for an empty paragraph', () => {
      component.tooltipText = '<p></p>';
      fixture.detectChanges();
      expect(getSaveButton()?.disabled).toBe(true);
    });

    it('should enable save button for formatted tooltip text', () => {
      component.tooltipText = '<p><strong>some text</strong></p>';
      fixture.detectChanges();
      expect(getSaveButton()?.disabled).toBe(false);
    });
  });

  describe('with an existing tooltip', () => {
    beforeEach(async () => {
      await configureTestBed({ tooltipText: 'some text', tooltipPosition: 'above' });
    });

    it('should initialize with given values and show delete button', () => {
      expect(component.tooltipText).toBe('some text');
      expect(component.tooltipPosition).toBe('above');
      expect(component.newTooltip).toBe(false);
      const buttons = fixture.nativeElement.querySelectorAll('mat-dialog-actions button');
      expect(buttons.length).toBe(3);
    });

    it('should enable save button', () => {
      expect(getSaveButton()?.disabled).toBe(false);
    });
  });
});
