import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import {
  MessageStimulusComponent
} from 'editor/modules/section-templates/components/stimulus/message-stimulus/message-stimulus.component';

describe('MessageStimulusComponent', () => {
  let component: MessageStimulusComponent;
  let fixture: ComponentFixture<MessageStimulusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MessageStimulusComponent],
      imports: [
        FormsModule,
        MatRadioModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MessageStimulusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with German placeholder options', () => {
    expect(component.options.lang).toBe('de');
    expect(component.options.instruction).toBe('Instruktion');
    expect(component.options.from).toBe('Platzhalter Absender');
    expect(component.options.subText).toBe('Platzhalter Quelle');
  });

  it('should update the language via the radio buttons', () => {
    const radioInputs = fixture.nativeElement.querySelectorAll('mat-radio-button input[type="radio"]');
    expect(radioInputs.length).toBe(3);

    (radioInputs[1] as HTMLInputElement).click();
    fixture.detectChanges();

    expect(component.options.lang).toBe('en');
  });
});
