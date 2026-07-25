// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, EventEmitter, Output } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { TranslateModule } from '@ngx-translate/core';
import { TextRadioOptions } from 'editor/modules/section-templates/models/radio-interfaces';
import {
  TextRadioComponent
} from 'editor/modules/section-templates/components/radio/text-radio/text-radio.component';
import {
  RadioWizardDialogComponent
} from 'editor/modules/section-templates/components/radio/radio-dialog/radio-dialog.component';

@Component({
  standalone: false,
  selector: 'aspect-editor-textradio-stimulus',
  template: ''
})
class MockTextRadioComponent {
  @Output() validityChange = new EventEmitter<boolean>();
}

@Component({
  standalone: false,
  selector: 'aspect-editor-imageradio-stimulus',
  template: ''
})
class MockImageRadioComponent {
  @Output() validityChange = new EventEmitter<boolean>();
}

describe('RadioWizardDialogComponent', () => {
  let component: RadioWizardDialogComponent;
  let fixture: ComponentFixture<RadioWizardDialogComponent>;

  const mockDialogRef = {
    close: vi.fn()
  };

  beforeEach(async () => {
    mockDialogRef.close.mockClear();

    await TestBed.configureTestingModule({
      declarations: [
        RadioWizardDialogComponent,
        MockTextRadioComponent,
        MockImageRadioComponent
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

    fixture = TestBed.createComponent(RadioWizardDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the variant choice until a variant is selected', () => {
    const variantButtons = fixture.nativeElement.querySelectorAll('mat-action-list button');
    expect(variantButtons.length).toBe(2);

    (variantButtons[0] as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(component.templateVariant).toBe('text');
    expect(fixture.nativeElement.querySelector('mat-action-list')).toBeNull();
    expect(fixture.nativeElement.querySelector('aspect-editor-textradio-stimulus')).toBeTruthy();
  });

  it('should update validity when the child component emits a change', () => {
    component.templateVariant = 'image';
    fixture.detectChanges();

    expect(component.isValid).toBe(false);
    const mockChild = fixture.debugElement
      .query(By.directive(MockImageRadioComponent)).componentInstance as MockImageRadioComponent;
    mockChild.validityChange.emit(true);
    fixture.detectChanges();

    expect(component.isValid).toBe(true);
  });

  it('should disable the confirm button until variant and validity are set', () => {
    const confirmButton = fixture.nativeElement.querySelector('div[mat-dialog-actions] button') as HTMLButtonElement;
    expect(confirmButton.disabled).toBe(true);

    component.templateVariant = 'text';
    fixture.detectChanges();
    expect(confirmButton.disabled).toBe(true);

    component.onValidityChange(true);
    fixture.detectChanges();
    expect(confirmButton.disabled).toBe(false);
  });

  it('should close the dialog with the text variant options on confirm', () => {
    const textOptions: TextRadioOptions = {
      label1: 'question',
      label2: '',
      options: [{ text: 'a' }, { text: 'b' }],
      addExtraInput: false,
      text1: 'reason',
      extraInputMathfield: false
    };
    component.templateVariant = 'text';
    component.textComp = { options: textOptions } as TextRadioComponent;

    component.confirmAndClose();

    expect(mockDialogRef.close).toHaveBeenCalledWith({ variant: 'text', options: textOptions });
  });

  it('should close the dialog without options when no variant is chosen', () => {
    component.confirmAndClose();
    expect(mockDialogRef.close).toHaveBeenCalledWith({ variant: undefined, options: undefined });
  });
});
