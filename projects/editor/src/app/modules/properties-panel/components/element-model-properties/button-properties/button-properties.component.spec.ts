import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { DialogService } from 'editor/src/app/services/dialog.service';
import {
  ButtonPropertiesComponent
} from './button-properties.component';

describe('ButtonPropertiesComponent', () => {
  let component: ButtonPropertiesComponent;
  let fixture: ComponentFixture<ButtonPropertiesComponent>;
  let dialogService: SpyObj<DialogService>;

  beforeEach(async () => {
    dialogService = createSpyObj<DialogService>(['showTooltipDialog']);

    await TestBed.configureTestingModule({
      declarations: [ButtonPropertiesComponent],
      imports: [
        CommonModule,
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: DialogService, useValue: dialogService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonPropertiesComponent);
    component = fixture.componentInstance;
    component.combinedProperties = {
      asLink: false,
      label: 'Weiter',
      tooltipText: 'old text',
      tooltipPosition: 'below'
    };
    fixture.detectChanges();
  });

  /* The label came from the grab bag, where one control served both the button and the likert. It is
     the same field name but not the same thing - here it is the text on the button, on the likert the
     caption of the options table - so it moved to each owner rather than onto a shared level. */
  it('should show the text on the button and emit an edit', () => {
    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea.value).toBe('Weiter');

    const emitted: { property: string; value: unknown }[] = [];
    component.updateModel.subscribe(update => emitted.push(update));
    textarea.value = 'Zurück';
    textarea.dispatchEvent(new Event('input'));

    expect(emitted).toEqual([{ property: 'label', value: 'Zurück' }]);
  });

  it('should render nothing for an element that is not a button', () => {
    component.combinedProperties = {};
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('textarea')).toBeNull();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the edit tooltip button', () => {
    const buttons = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>);
    expect(buttons.some(button => button.textContent?.includes('propertiesPanel.editTooltip'))).toBe(true);
  });

  it('should emit tooltip text and position on save', () => {
    dialogService.showTooltipDialog.mockReturnValue(
      of({ tooltipText: '<p>new text</p>', tooltipPosition: 'above', action: 'save' })
    );
    const emitted: { property: string; value: unknown }[] = [];
    component.updateModel.subscribe(update => emitted.push(update));

    component.editTooltip();

    expect(dialogService.showTooltipDialog).toHaveBeenCalledWith('old text', 'below');
    expect(emitted).toEqual([
      { property: 'tooltipText', value: '<p>new text</p>' },
      { property: 'tooltipPosition', value: 'above' }
    ]);
  });

  it('should emit empty tooltip text on delete', () => {
    dialogService.showTooltipDialog.mockReturnValue(
      of({ tooltipText: 'old text', tooltipPosition: 'below', action: 'delete' })
    );
    const emitted: { property: string; value: unknown }[] = [];
    component.updateModel.subscribe(update => emitted.push(update));

    component.editTooltip();

    expect(emitted).toEqual([{ property: 'tooltipText', value: '' }]);
  });

  it('should not emit anything when the dialog is cancelled', () => {
    dialogService.showTooltipDialog.mockReturnValue(of(undefined as never));
    const emitted: { property: string; value: unknown }[] = [];
    component.updateModel.subscribe(update => emitted.push(update));

    component.editTooltip();

    expect(emitted).toEqual([]);
  });

  it('should pass undefined instead of an empty tooltip text to the dialog', () => {
    dialogService.showTooltipDialog.mockReturnValue(of(undefined as never));
    component.combinedProperties = {
      asLink: false, tooltipText: '', tooltipPosition: 'below'
    };

    component.editTooltip();

    expect(dialogService.showTooltipDialog).toHaveBeenCalledWith(undefined, 'below');
  });
});
