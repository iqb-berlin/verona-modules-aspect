import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { Mock } from 'vitest';
import {
  RichTextEditDialogComponent
} from 'editor/src/app/components/dialogs/rich-text-edit-dialog/rich-text-edit-dialog.component';

@Component({
  selector: 'aspect-rich-text-editor',
  template: '',
  standalone: false
})
class MockRichTextEditorComponent {
  @Input() content!: string | Record<string, unknown>;
  @Input() defaultFontSize!: number;
  @Input() clozeMode: boolean = false;
  @Input() autoFocus: boolean = false;
  @Input() controlPanelFolded: boolean = true;
  @Input() showWordCounter: boolean = false;
  @Output() contentChange = new EventEmitter<string>();
}

describe('RichTextEditDialogComponent', () => {
  let component: RichTextEditDialogComponent;
  let fixture: ComponentFixture<RichTextEditDialogComponent>;
  let dialogRefMock: { close: Mock };

  const getEditor = (): MockRichTextEditorComponent => fixture.debugElement
    .query(By.directive(MockRichTextEditorComponent)).componentInstance as MockRichTextEditorComponent;

  const getActionButtons = (): HTMLButtonElement[] => Array
    .from(fixture.nativeElement.querySelectorAll('.mat-mdc-dialog-actions button') as NodeListOf<HTMLButtonElement>);

  beforeEach(async () => {
    dialogRefMock = { close: vi.fn() };
    await TestBed.configureTestingModule({
      declarations: [
        RichTextEditDialogComponent,
        MockRichTextEditorComponent
      ],
      imports: [
        MatDialogModule,
        MatButtonModule,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: { content: '<p>Text</p>', defaultFontSize: 20, clozeMode: false }
        },
        { provide: MatDialogRef, useValue: dialogRefMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RichTextEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should configure the editor with the injected data', () => {
    const editor = getEditor();
    expect(editor.content).toBe('<p>Text</p>');
    expect(editor.defaultFontSize).toBe(20);
    expect(editor.clozeMode).toBe(false);
    expect(editor.showWordCounter).toBe(true);
    expect(editor.autoFocus).toBe(true);
    expect(editor.controlPanelFolded).toBe(false);
  });

  it('should take over content changes of the editor', () => {
    getEditor().contentChange.emit('<p>Neuer Text</p>');
    fixture.detectChanges();

    expect(component.data.content).toBe('<p>Neuer Text</p>');
  });

  it('should close with the edited content', () => {
    getEditor().contentChange.emit('<p>Neuer Text</p>');
    fixture.detectChanges();

    getActionButtons()[0].click();

    expect(dialogRefMock.close).toHaveBeenCalledWith('<p>Neuer Text</p>');
  });

  it('should close without a result on cancel', () => {
    getActionButtons()[1].click();

    expect(dialogRefMock.close).toHaveBeenCalledTimes(1);
    expect(dialogRefMock.close.mock.lastCall?.[0]).toBeFalsy();
  });
});
