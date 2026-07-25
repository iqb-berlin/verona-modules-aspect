import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import {
  MarkingPanelDialogComponent
} from 'editor/modules/section-templates/components/marking-panel-dialog/marking-panel-dialog.component';

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

describe('MarkingPanelDialogComponent', () => {
  let component: MarkingPanelDialogComponent;
  let fixture: ComponentFixture<MarkingPanelDialogComponent>;

  const mockDialogRef = {
    close: vi.fn()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MarkingPanelDialogComponent,
        MockRichTextEditorComponent
      ],
      imports: [
        FormsModule,
        MatDialogModule,
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatRadioModule,
        MatSelectModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { availableTextIDs: ['text_1', 'text_2'] } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MarkingPanelDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should receive available text IDs from the dialog data', () => {
    expect(component.data.availableTextIDs).toEqual(['text_1', 'text_2']);
  });

  it('should initialize with default values', () => {
    expect(component.text1).toBe('');
    expect(component.showHelper).toBe(true);
    expect(component.markingMode).toBe('word');
    expect(component.connectedText).toBeUndefined();
  });

  it('should switch the marking mode via the radio buttons', () => {
    const radioInputs = fixture.nativeElement.querySelectorAll('mat-radio-button input[type="radio"]');
    expect(radioInputs.length).toBe(2);

    (radioInputs[1] as HTMLInputElement).click();
    fixture.detectChanges();

    expect(component.markingMode).toBe('range');
  });

  it('should close the dialog with the entered values on confirm', () => {
    component.text1 = 'question';
    component.markingMode = 'range';
    component.connectedText = 'text_2';
    component.showHelper = false;
    fixture.detectChanges();

    const confirmButton = fixture.nativeElement.querySelector('div[mat-dialog-actions] button') as HTMLButtonElement;
    confirmButton.click();

    expect(mockDialogRef.close).toHaveBeenCalledWith({
      text1: 'question',
      showHelper: false,
      markingMode: 'range',
      connectedText: 'text_2'
    });
  });
});
