import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { Stylings } from 'common/models/elements/property-group-interfaces';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import {
  MergedCheckboxComponent
} from 'editor/src/app/modules/properties-panel/components/merged-checkbox/merged-checkbox.component';
import { ElementService } from 'editor/src/app/services/element.service';
import { MessageService } from 'editor/src/app/services/message.service';
import {
  ElementStylePropertiesComponent
} from 'editor/src/app/modules/properties-panel/components/element-style-properties/element-style-properties.component';
import { NumberFieldDirective } from 'editor/modules/editor-shared/directives/number-field.directive';

describe('ElementStylePropertiesComponent', () => {
  let component: ElementStylePropertiesComponent;
  let fixture: ComponentFixture<ElementStylePropertiesComponent>;
  let elementService: SpyObj<ElementService>;
  let messageService: SpyObj<MessageService>;

  beforeEach(async () => {
    elementService = createSpyObj<ElementService>(['updateSelectedElementsStyleProperty']);
    messageService = createSpyObj<MessageService>(['showWarning']);

    await TestBed.configureTestingModule({
      declarations: [ElementStylePropertiesComponent, MergedCheckboxComponent, NumberFieldDirective],
      imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: ElementService, useValue: elementService },
        { provide: MessageService, useValue: messageService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ElementStylePropertiesComponent);
    component = fixture.componentInstance;
    component.styles = {
      backgroundColor: '#ffffff',
      fontColor: '#000000',
      bold: false,
      italic: false,
      underline: false,
      fontSize: 20
    } as Stylings;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render fields for the given style properties only', () => {
    const labels = Array.from(
      fixture.nativeElement.querySelectorAll('mat-label') as NodeListOf<HTMLElement>
    ).map(label => label.textContent);
    expect(labels.some(label => label?.includes('propertiesPanel.backgroundColor'))).toBe(true);
    expect(labels.some(label => label?.includes('propertiesPanel.lineHeight'))).toBe(false);
    expect(fixture.nativeElement.querySelector('fieldset')).toBeNull(); // no border styles given
  });

  it('should update the style property when a checkbox is toggled', () => {
    const boldCheckbox = Array.from(
      fixture.nativeElement.querySelectorAll('mat-checkbox') as NodeListOf<HTMLElement>
    ).find(checkbox => checkbox.textContent?.includes('propertiesPanel.bold'));

    boldCheckbox?.querySelector('input')?.click();

    expect(elementService.updateSelectedElementsStyleProperty).toHaveBeenCalledWith('bold', true);
  });

  it('should update the style property when a text value is entered', () => {
    const colorInput = fixture.nativeElement.querySelector('input[type="text"]') as HTMLInputElement;
    colorInput.value = '#ff0000';
    colorInput.dispatchEvent(new Event('input'));

    expect(elementService.updateSelectedElementsStyleProperty)
      .toHaveBeenCalledWith('backgroundColor', '#ff0000');
  });

  /* The four number boxes here wrote into the ElementService straight from the template, so the
     host's guard never covered them: an emptied box sent null into a property declared `number`,
     and the `(change)` handler that patched the display back to 0 assigned into `styles` - with
     one element selected that is the element's own object, so it wrote past the service (#1161).

     They go through `aspectNumberField` now. The directive is in `declarations` rather than pulled
     in through `NumberFieldModule`, for the reason recorded in the dimension-field-set spec. */
  describe('the number boxes', () => {
    const box = (): HTMLInputElement => fixture.nativeElement
      .querySelector('input[type="number"]') as HTMLInputElement;

    const type = (value: string): void => {
      box().value = value;
      box().dispatchEvent(new Event('input'));
      fixture.detectChanges();
    };
    const leave = async (): Promise<void> => {
      box().dispatchEvent(new Event('blur'));
      fixture.detectChanges();
      await fixture.whenStable();
    };

    it('should write an edited font size', () => {
      type('24');

      expect(elementService.updateSelectedElementsStyleProperty).toHaveBeenCalledWith('fontSize', 24);
    });

    /* `fontSize` is declared `number`, so its box is `required` and an empty one is refused. The
       0 it used to stand in for was destructive here on top of everything else: `font-size: 0px`
       makes the text invisible, and the same box for `lineHeight` collapses it (#1161). */
    it('should refuse a font size left empty and put the box back', async () => {
      type('');
      expect(elementService.updateSelectedElementsStyleProperty).not.toHaveBeenCalled();

      await leave();

      expect(elementService.updateSelectedElementsStyleProperty).not.toHaveBeenCalled();
      expect(box().value).toBe('20');
      expect(messageService.showWarning).toHaveBeenCalledTimes(1);
    });

    it('should refuse a negative font size and put the box back', async () => {
      type('-5');

      await leave();

      expect(elementService.updateSelectedElementsStyleProperty).not.toHaveBeenCalled();
      expect(box().value).toBe('20');
      expect(messageService.showWarning).toHaveBeenCalledTimes(1);
    });

    /* #1153: the border width box committed to `borderRadius`, a copy-paste slip that existed
       because the pattern was written out by hand at every box. Migrating removes it - each box
       names its property once, and the directive holds the rest. What is left to get wrong is that
       one name, so that is what this pins, at the last box rather than the first. */
    it('should commit the border width to the border width', async () => {
      component.styles = { ...component.styles, borderRadius: 4, borderWidth: 2 } as Stylings;
      fixture.detectChanges();
      await fixture.whenStable();
      const borderWidthBox = Array.from(
        fixture.nativeElement.querySelectorAll('input[type="number"]') as NodeListOf<HTMLInputElement>
      ).at(-1) as HTMLInputElement;

      borderWidthBox.value = '3';
      borderWidthBox.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(elementService.updateSelectedElementsStyleProperty).toHaveBeenCalledWith('borderWidth', 3);
      expect(elementService.updateSelectedElementsStyleProperty)
        .not.toHaveBeenCalledWith('borderRadius', expect.anything());
      expect(component.styles?.borderRadius).toBe(4);
    });

    /* And nothing at all reaches the service for a refused entry - neither the box's own property
       nor, as in the slip above, someone else's. */
    it('should write nothing for an emptied border width', async () => {
      component.styles = { ...component.styles, borderRadius: 4, borderWidth: 2 } as Stylings;
      fixture.detectChanges();
      await fixture.whenStable();
      const borderWidthBox = Array.from(
        fixture.nativeElement.querySelectorAll('input[type="number"]') as NodeListOf<HTMLInputElement>
      ).at(-1) as HTMLInputElement;

      borderWidthBox.value = '';
      borderWidthBox.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      borderWidthBox.dispatchEvent(new Event('blur'));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(elementService.updateSelectedElementsStyleProperty).not.toHaveBeenCalled();
      expect(borderWidthBox.value).toBe('2');
      expect(messageService.showWarning).toHaveBeenCalledTimes(1);
    });
  });
});
