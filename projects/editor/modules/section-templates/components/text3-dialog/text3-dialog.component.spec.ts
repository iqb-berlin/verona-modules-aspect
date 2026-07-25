import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { By } from '@angular/platform-browser';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import {
  Text3WizardDialogComponent
} from 'editor/modules/section-templates/components/text3-dialog/text3-dialog.component';

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

describe('Text3WizardDialogComponent', () => {
  let component: Text3WizardDialogComponent;
  let fixture: ComponentFixture<Text3WizardDialogComponent>;

  const mockDialogRef = {
    close: vi.fn()
  };

  beforeEach(async () => {
    mockDialogRef.close.mockClear();

    await TestBed.configureTestingModule({
      declarations: [
        Text3WizardDialogComponent,
        MockRichTextEditorComponent
      ],
      imports: [
        MatDialogModule,
        MatButtonModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Text3WizardDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render five text editors', () => {
    const editors = fixture.debugElement.queryAll(By.directive(MockRichTextEditorComponent));
    expect(editors.length).toBe(5);
  });

  it('should update the description when the first editor emits a change', () => {
    const editors = fixture.debugElement.queryAll(By.directive(MockRichTextEditorComponent));

    (editors[0].componentInstance as MockRichTextEditorComponent).contentChange.emit('idea description');
    fixture.detectChanges();

    expect(component.text1).toBe('idea description');
  });

  it('should close the dialog with all five texts on confirm', () => {
    component.text1 = 'one';
    component.text2 = 'two';
    component.text3 = 'three';
    component.text4 = 'four';
    component.text5 = 'five';
    fixture.detectChanges();

    const confirmButton = fixture.nativeElement.querySelector('div[mat-dialog-actions] button') as HTMLButtonElement;
    confirmButton.click();

    expect(mockDialogRef.close).toHaveBeenCalledWith({
      text1: 'one', text2: 'two', text3: 'three', text4: 'four', text5: 'five'
    });
  });
});
