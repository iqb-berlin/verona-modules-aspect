import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CONSTANTS } from 'editor/modules/section-templates/constants';
import {
  TextStimulusComponent
} from 'editor/modules/section-templates/components/stimulus/text-stimulus/text-stimulus.component';

@Component({
  standalone: false,
  selector: 'aspect-rich-text-editor',
  template: ''
})
class MockRichTextEditorComponent {
  @Input() content: string = '';
  @Input() placeholder: string = '';
  @Input() controlPanelFolded: boolean = false;
  @Input() showWordCounter: boolean = false;
  @Input() showReducedControls: boolean = false;
  @Output() contentChange = new EventEmitter<string>();
}

describe('TextStimulusComponent', () => {
  let component: TextStimulusComponent;
  let fixture: ComponentFixture<TextStimulusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        TextStimulusComponent,
        MockRichTextEditorComponent
      ],
      imports: [
        FormsModule,
        MatCheckboxModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TextStimulusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with the placeholder text and marking disabled', () => {
    expect(component.options.text1).toBe(CONSTANTS.textStimulus);
    expect(component.options.text2).toBe('');
    expect(component.options.allowMarking).toBe(false);
  });

  it('should update the source text when the editor emits a change', () => {
    const editors = fixture.debugElement.queryAll(By.directive(MockRichTextEditorComponent));
    expect(editors.length).toBe(2);

    (editors[1].componentInstance as MockRichTextEditorComponent).contentChange.emit('new source');
    fixture.detectChanges();

    expect(component.options.text2).toBe('new source');
  });

  it('should toggle marking via the checkbox', () => {
    const checkboxInput = fixture.nativeElement.querySelector('mat-checkbox input') as HTMLInputElement;
    checkboxInput.click();
    fixture.detectChanges();

    expect(component.options.allowMarking).toBe(true);
  });
});
