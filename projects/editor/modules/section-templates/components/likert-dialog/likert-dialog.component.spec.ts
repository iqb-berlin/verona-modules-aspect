// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { TextImageLabel } from 'common/models/label-interfaces';
import {
  LikertWizardDialogComponent
} from 'editor/modules/section-templates/components/likert-dialog/likert-dialog.component';

@Component({
  standalone: false,
  selector: 'aspect-rich-text-editor',
  template: ''
})
class MockRichTextEditorComponent {
  @Input() content: string = '';
  @Input() placeholder: string = '';
  @Output() contentChange = new EventEmitter<string>();
}

@Component({
  standalone: false,
  selector: 'aspect-option-list-panel',
  template: ''
})
class MockOptionListPanelComponent {
  @Input() textFieldLabel: string = '';
  @Input() itemList: TextImageLabel[] = [];
  @Input() showImageButton: boolean = false;
  @Input() localMode: boolean = false;
  @Output() itemListUpdated = new EventEmitter<void>();
}

describe('LikertWizardDialogComponent', () => {
  let component: LikertWizardDialogComponent;
  let fixture: ComponentFixture<LikertWizardDialogComponent>;

  const mockDialogRef = {
    close: vi.fn()
  };

  const createLabel = (text: string): TextImageLabel => ({
    text, imgSrc: null, imgFileName: '', imgPosition: 'above'
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        LikertWizardDialogComponent,
        MockRichTextEditorComponent,
        MockOptionListPanelComponent
      ],
      imports: [
        FormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LikertWizardDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty texts, options and rows', () => {
    expect(component.text1).toBe('');
    expect(component.text2).toBe('');
    expect(component.options).toEqual([]);
    expect(component.rows).toEqual([]);
  });

  it('should disable the confirm button until options and rows are present', () => {
    const confirmButton = fixture.nativeElement.querySelector('div[mat-dialog-actions] button') as HTMLButtonElement;
    expect(confirmButton.disabled).toBe(true);

    component.options.push(createLabel('option 1'));
    fixture.detectChanges();
    expect(confirmButton.disabled).toBe(true);

    component.rows.push(createLabel('row 1'));
    fixture.detectChanges();
    expect(confirmButton.disabled).toBe(false);
  });

  it('should close the dialog with the entered values on confirm', () => {
    component.text1 = 'question';
    component.text2 = 'sentence start';
    component.options = [createLabel('option 1')];
    component.rows = [createLabel('row 1')];
    fixture.detectChanges();

    const confirmButton = fixture.nativeElement.querySelector('div[mat-dialog-actions] button') as HTMLButtonElement;
    confirmButton.click();

    expect(mockDialogRef.close).toHaveBeenCalledWith({
      text1: 'question',
      text2: 'sentence start',
      options: component.options,
      rows: component.rows
    });
  });
});
