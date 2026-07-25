// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, EventEmitter, Output } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { TranslateModule } from '@ngx-translate/core';
import { EmailStimulusOptions } from 'editor/modules/section-templates/models/stimulus-interfaces';
import {
  EmailStimulusComponent
} from 'editor/modules/section-templates/components/stimulus/email-stimulus/email-stimulus.component';
import {
  StimulusWizardDialogComponent
} from 'editor/modules/section-templates/components/stimulus/stimulus-dialog/stimulus-dialog.component';

@Component({
  standalone: false,
  selector: 'aspect-editor-text-stimulus',
  template: ''
})
class MockTextStimulusComponent {}

@Component({
  standalone: false,
  selector: 'aspect-editor-email-stimulus',
  template: ''
})
class MockEmailStimulusComponent {}

@Component({
  standalone: false,
  selector: 'aspect-editor-message-stimulus',
  template: ''
})
class MockMessageStimulusComponent {}

@Component({
  standalone: false,
  selector: 'aspect-editor-audio1-stimulus',
  template: ''
})
class MockAudio1StimulusComponent {
  @Output() validityChange = new EventEmitter<boolean>();
}

@Component({
  standalone: false,
  selector: 'aspect-editor-audio2-stimulus',
  template: ''
})
class MockAudio2StimulusComponent {
  @Output() validityChange = new EventEmitter<boolean>();
}

describe('StimulusWizardDialogComponent', () => {
  let component: StimulusWizardDialogComponent;
  let fixture: ComponentFixture<StimulusWizardDialogComponent>;

  const mockDialogRef = {
    close: vi.fn()
  };

  beforeEach(async () => {
    mockDialogRef.close.mockClear();

    await TestBed.configureTestingModule({
      declarations: [
        StimulusWizardDialogComponent,
        MockTextStimulusComponent,
        MockEmailStimulusComponent,
        MockMessageStimulusComponent,
        MockAudio1StimulusComponent,
        MockAudio2StimulusComponent
      ],
      imports: [
        MatDialogModule,
        MatButtonModule,
        MatListModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StimulusWizardDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should offer five variants and mark reading stimuli as valid on selection', () => {
    const variantButtons = fixture.nativeElement.querySelectorAll('mat-action-list button');
    expect(variantButtons.length).toBe(5);

    (variantButtons[1] as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(component.templateVariant).toBe('email');
    expect(component.isValid).toBe(true);
    expect(fixture.nativeElement.querySelector('aspect-editor-email-stimulus')).toBeTruthy();
  });

  it('should keep audio variants invalid until the child reports validity', () => {
    const variantButtons = fixture.nativeElement.querySelectorAll('mat-action-list button');
    (variantButtons[3] as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(component.templateVariant).toBe('audio1');
    expect(component.isValid).toBe(false);

    const mockChild = fixture.debugElement
      .query(By.directive(MockAudio1StimulusComponent)).componentInstance as MockAudio1StimulusComponent;
    mockChild.validityChange.emit(true);
    fixture.detectChanges();

    expect(component.isValid).toBe(true);
  });

  it('should disable the confirm button until variant and validity are set', () => {
    const confirmButton = fixture.nativeElement.querySelector('div[mat-dialog-actions] button') as HTMLButtonElement;
    expect(confirmButton.disabled).toBe(true);

    component.templateVariant = 'audio2';
    fixture.detectChanges();
    expect(confirmButton.disabled).toBe(true);

    component.onValidityChange(true);
    fixture.detectChanges();
    expect(confirmButton.disabled).toBe(false);
  });

  it('should close the dialog with the email variant options on confirm', () => {
    const emailOptions: EmailStimulusOptions = {
      instruction: 'Instruktion',
      from: 'sender',
      to: 'recipient',
      subject: 'subject',
      body: 'body',
      subText: 'source',
      lang: 'de',
      allowMarking: false
    };
    component.templateVariant = 'email';
    component.emailComp = { options: emailOptions } as EmailStimulusComponent;

    component.confirmAndClose();

    expect(mockDialogRef.close).toHaveBeenCalledWith({ variant: 'email', options: emailOptions });
  });

  it('should close the dialog without options when no variant is chosen', () => {
    component.confirmAndClose();
    expect(mockDialogRef.close).toHaveBeenCalledWith({ variant: undefined, options: undefined });
  });
});
