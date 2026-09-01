import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DropdownElement, DropdownProperties } from 'common/models/elements/dropdown';
import { SafeResourceHTMLPipe } from 'common/pipes/safe-resource-html.pipe';
import { DropdownComponent } from './dropdown.component';

describe('DropdownComponent', () => {
  let component: DropdownComponent;
  let fixture: ComponentFixture<DropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DropdownComponent, SafeResourceHTMLPipe],
      imports: [
        ReactiveFormsModule,
        MatSelectModule,
        MatFormFieldModule
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DropdownComponent);
    component = fixture.componentInstance;
    component.elementModel = new DropdownElement({
      type: 'dropdown',
      id: 'test-id',
      alias: 'test-alias',
      options: [{ text: 'Option 1' }, { text: 'Option 2' }],
      dimensions: {
        width: 150,
        height: 30,
        isWidthFixed: false,
        isHeightFixed: true,
        minHeight: null,
        minWidth: 40
      }
    } as Partial<DropdownProperties>);
    component.parentForm = new UntypedFormGroup({
      'test-id': new UntypedFormControl(null)
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display label if not in clozeContext', () => {
    component.clozeContext = false;
    component.elementModel.label = 'Test Label';
    fixture.detectChanges();
    const labelElement = fixture.nativeElement.querySelector('mat-label');
    expect(labelElement.textContent).toContain('Test Label');
  });

  it('should NOT display label if in clozeContext', () => {
    component.clozeContext = true;
    fixture.detectChanges();
    const labelElement = fixture.nativeElement.querySelector('mat-label');
    expect(labelElement).toBeNull();
  });

  /* Material sizes and colours the chosen option and the list from tokens of its own, so nothing of
     what the element says about its font reached them: the size set in the panel moved the label and
     nothing else, and inside a cloze, where there is no label, it did nothing at all (#1435). The
     list is a second place because it is rendered into an overlay outside the component. */
  describe('the font of the chosen option and the list', () => {
    /* Measured where the text is drawn rather than on the element the style is written to: Material
       puts its own tokens on the box in between, and an underline does not even cross into it. */
    const chosenOption = (): HTMLElement => fixture.nativeElement
      .querySelector('.mat-mdc-select-value') as HTMLElement;

    const openList = async (): Promise<HTMLElement> => {
      (fixture.nativeElement.querySelector('.mat-mdc-select-trigger') as HTMLElement).click();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      return document.querySelector('.mat-mdc-option') as HTMLElement;
    };

    [true, false].forEach(clozeContext => {
      it(`should size the chosen option with the element's font size, clozeContext=${clozeContext}`, () => {
        component.clozeContext = clozeContext;
        component.elementModel.styling.fontSize = 28;
        fixture.detectChanges();

        expect(window.getComputedStyle(chosenOption()).fontSize).toBe('28px');
      });
    });

    it('should size the list with the same font size', async () => {
      component.elementModel.styling.fontSize = 28;
      fixture.detectChanges();

      const option = await openList();

      expect(window.getComputedStyle(option).fontSize).toBe('28px');
    });

    it('should carry the rest of the font settings as well', () => {
      component.elementModel.styling = {
        ...component.elementModel.styling,
        fontColor: 'rgb(0, 96, 100)',
        bold: true,
        italic: true,
        underline: true
      };
      fixture.detectChanges();

      const style = window.getComputedStyle(chosenOption());
      expect(style.color).toBe('rgb(0, 96, 100)');
      expect(style.fontWeight).toBe('700');
      expect(style.fontStyle).toBe('italic');
      expect(style.textDecorationLine).toBe('underline');
    });

    /* The theme pins the line of the chosen option to 24px while the glyphs grow with the size, and
       Material hides what overflows -- so a larger font lost the tops and tails of its letters. */
    it('should give a large font room to be read', () => {
      component.elementModel.styling.fontSize = 40;
      fixture.detectChanges();

      expect(chosenOption().scrollHeight).toBeLessThanOrEqual(chosenOption().clientHeight);
      expect(window.getComputedStyle(chosenOption()).lineHeight).toBe('normal');
    });
  });

  /* The colour reaches Material's generated wrapper through a CSS variable, and the rule that reads it
     used to sit inside the cloze block -- so a standalone dropdown kept the theme background (#1388).
     Measured on the rendered wrapper, not on the variable: the variable was set correctly all along. */
  [true, false].forEach(clozeContext => {
    it(`should paint the background colour on the wrapper, clozeContext=${clozeContext}`, () => {
      component.clozeContext = clozeContext;
      component.elementModel.styling.backgroundColor = 'rgb(255, 215, 0)';
      fixture.detectChanges();
      const wrapper = fixture.nativeElement.querySelector('.mat-mdc-text-field-wrapper');
      expect(window.getComputedStyle(wrapper).backgroundColor).toBe('rgb(255, 215, 0)');
    });
  });
});
