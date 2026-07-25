import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import {
  EmailStimulusComponent
} from 'editor/modules/section-templates/components/stimulus/email-stimulus/email-stimulus.component';

describe('EmailStimulusComponent', () => {
  let component: EmailStimulusComponent;
  let fixture: ComponentFixture<EmailStimulusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmailStimulusComponent],
      imports: [
        FormsModule,
        MatRadioModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EmailStimulusComponent);
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
    expect(component.options.to).toBe('Platzhalter Empfänger');
    expect(component.options.subject).toBe('Platzhalter Betreff');
    expect(component.options.allowMarking).toBe(false);
  });

  it('should offer three languages', () => {
    const radioInputs = fixture.nativeElement.querySelectorAll('mat-radio-button input[type="radio"]');
    expect(radioInputs.length).toBe(3);
  });

  it('should update the language via the radio buttons', () => {
    const radioInputs = fixture.nativeElement.querySelectorAll('mat-radio-button input[type="radio"]');
    (radioInputs[2] as HTMLInputElement).click();
    fixture.detectChanges();

    expect(component.options.lang).toBe('fr');
  });
});
