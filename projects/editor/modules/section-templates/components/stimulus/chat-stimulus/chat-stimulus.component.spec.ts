import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { TranslateModule } from '@ngx-translate/core';
import {
  ChatStimulusComponent
} from 'editor/modules/section-templates/components/stimulus/chat-stimulus/chat-stimulus.component';

@Component({
  standalone: false,
  selector: 'aspect-rich-text-editor',
  template: ''
})
class MockRichTextEditorComponent {
  @Input() content: string = '';
  @Input() placeholder: string = '';
  @Input() showReducedControls: boolean = false;
  @Output() contentChange = new EventEmitter<string>();
}

describe('ChatStimulusComponent', () => {
  let component: ChatStimulusComponent;
  let fixture: ComponentFixture<ChatStimulusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ChatStimulusComponent,
        MockRichTextEditorComponent
      ],
      imports: [
        FormsModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        MatRadioModule,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatStimulusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty options and German language', () => {
    expect(component.options.instruction).toBe('');
    expect(component.options.from).toBe('');
    expect(component.options.to).toBe('');
    expect(component.options.subject).toBe('');
    expect(component.options.body).toBe('');
    expect(component.options.lang).toBe('de');
    expect(component.options.allowMarking).toBe(false);
  });

  it('should update the instruction when the editor emits a change', () => {
    const editors = fixture.debugElement.queryAll(By.directive(MockRichTextEditorComponent));
    expect(editors.length).toBe(3);

    (editors[0].componentInstance as MockRichTextEditorComponent).contentChange.emit('new instruction');
    fixture.detectChanges();

    expect(component.options.instruction).toBe('new instruction');
  });

  it('should update the language via the radio buttons', () => {
    const radioInputs = fixture.nativeElement.querySelectorAll('mat-radio-button input[type="radio"]');
    (radioInputs[1] as HTMLInputElement).click();
    fixture.detectChanges();

    expect(component.options.lang).toBe('en');
  });

  it('should toggle marking via the checkbox', () => {
    const checkboxInput = fixture.nativeElement.querySelector('mat-checkbox input') as HTMLInputElement;
    checkboxInput.click();
    fixture.detectChanges();

    expect(component.options.allowMarking).toBe(true);
  });
});
