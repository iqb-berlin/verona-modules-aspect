// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { Label } from 'common/models/label-interfaces';
import {
  TextRadioComponent
} from 'editor/modules/section-templates/components/radio/text-radio/text-radio.component';

@Component({
  standalone: false,
  selector: 'aspect-rich-text-editor',
  template: ''
})
class MockRichTextEditorComponent {
  @Input() content: string = '';
  @Input() placeholder: string = '';
  @Input() controlPanelFolded: boolean = false;
  @Input() disabled: boolean = false;
  @Output() contentChange = new EventEmitter<string>();
}

@Component({
  standalone: false,
  selector: 'aspect-option-list-panel',
  template: ''
})
class MockOptionListPanelComponent {
  @Input() textFieldLabel: string = '';
  @Input() itemList: Label[] = [];
  @Input() localMode: boolean = false;
  @Output() itemListUpdated = new EventEmitter<void>();
}

describe('TextRadioComponent', () => {
  let component: TextRadioComponent;
  let fixture: ComponentFixture<TextRadioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        TextRadioComponent,
        MockRichTextEditorComponent,
        MockOptionListPanelComponent
      ],
      imports: [
        FormsModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TextRadioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default options', () => {
    expect(component.options.label1).toBe('');
    expect(component.options.options).toEqual([]);
    expect(component.options.addExtraInput).toBe(false);
    expect(component.options.text1).toBe('Begründe deine Entscheidung.');
    expect(component.options.extraInputMathfield).toBe(false);
  });

  it('should emit invalid state with fewer than two options', () => {
    const emitSpy = vi.spyOn(component.validityChange, 'emit');
    component.options.options = [{ text: 'a' }];

    component.checkValidity();

    expect(emitSpy).toHaveBeenCalledWith(false);
  });

  it('should emit valid state with at least two options', () => {
    const emitSpy = vi.spyOn(component.validityChange, 'emit');
    component.options.options = [{ text: 'a' }, { text: 'b' }];

    component.checkValidity();

    expect(emitSpy).toHaveBeenCalledWith(true);
  });

  it('should check validity when the option list is updated', () => {
    const checkValiditySpy = vi.spyOn(component, 'checkValidity');
    const optionListPanels = fixture.debugElement.queryAll(By.directive(MockOptionListPanelComponent));
    expect(optionListPanels.length).toBe(1);

    (optionListPanels[0].componentInstance as MockOptionListPanelComponent).itemListUpdated.emit();

    expect(checkValiditySpy).toHaveBeenCalled();
  });
});
