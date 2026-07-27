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
import { TextImageLabel } from 'common/models/label-interfaces';
import {
  ImageRadioComponent
} from 'editor/modules/section-templates/components/radio/image-radio/image-radio.component';

@Component({
  standalone: false,
  selector: 'aspect-rich-text-editor',
  template: ''
})
class MockRichTextEditorComponent {
  @Input() content: string = '';
  @Input() placeholder: string = '';
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
  @Input() itemList: TextImageLabel[] = [];
  @Input() showImageButton: boolean = false;
  @Input() localMode: boolean = false;
  @Output() itemListUpdated = new EventEmitter<void>();
}

describe('ImageRadioComponent', () => {
  let component: ImageRadioComponent;
  let fixture: ComponentFixture<ImageRadioComponent>;

  const createLabel = (text: string): TextImageLabel => ({
    text, imgSrc: null, imgFileName: '', imgPosition: 'above'
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ImageRadioComponent,
        MockRichTextEditorComponent,
        MockOptionListPanelComponent
      ],
      imports: [
        FormsModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ImageRadioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default options', () => {
    expect(component.options.label1).toBe('');
    expect(component.options.options).toEqual([]);
    expect(component.options.itemsPerRow).toBe(4);
    expect(component.options.addExtraInput).toBe(false);
    expect(component.options.extraInputMathfield).toBe(false);
  });

  it('should emit invalid state with fewer than two options', () => {
    const emitSpy = vi.spyOn(component.validityChange, 'emit');
    component.options.options = [createLabel('a')];

    component.checkValidity();

    expect(emitSpy).toHaveBeenCalledWith(false);
  });

  it('should emit valid state with at least two options', () => {
    const emitSpy = vi.spyOn(component.validityChange, 'emit');
    component.options.options = [createLabel('a'), createLabel('b')];

    component.checkValidity();

    expect(emitSpy).toHaveBeenCalledWith(true);
  });

  it('should check validity when the option list is updated', () => {
    const checkValiditySpy = vi.spyOn(component, 'checkValidity');
    const optionListPanel = fixture.debugElement.query(By.directive(MockOptionListPanelComponent));

    (optionListPanel.componentInstance as MockOptionListPanelComponent).itemListUpdated.emit();

    expect(checkValiditySpy).toHaveBeenCalled();
  });
});
