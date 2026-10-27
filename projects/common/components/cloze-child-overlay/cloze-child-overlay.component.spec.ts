import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Directive, Input, NO_ERRORS_SCHEMA } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ToggleButtonElement } from 'common/models/elements/toggle-button';
import {
  TextFieldSimpleElement, TextFieldSimpleProperties
} from 'common/models/elements/text-field-simple';
import { DimensionProperties } from 'common/models/elements/property-group-interfaces';
import {
  TextFieldSimpleComponent
} from 'common/components/elements/text-field-simple/text-field-simple.component';
import { ButtonComponent } from 'common/components/elements/button/button.component';
import { ButtonElement, ButtonProperties } from 'common/models/elements/button';
import { TooltipPosition } from 'common/models/ui-element-interfaces';
import { ClozeChildOverlayComponent } from './cloze-child-overlay.component';

@Directive({
  selector: '[pointerEventTooltip]',
  standalone: false
})
class MockPointerEventTooltipDirective {
  @Input() tooltipText!: string;
  @Input() tooltipPosition!: TooltipPosition;
}

describe('ClozeChildOverlayComponent', () => {
  let component: ClozeChildOverlayComponent;
  let fixture: ComponentFixture<ClozeChildOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClozeChildOverlayComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ClozeChildOverlayComponent);
    component = fixture.componentInstance;
    component.element = {
      type: 'toggle-button',
      dimensions: {
        width: 100, height: 20, isWidthFixed: true, isHeightFixed: true
      }
    } as ToggleButtonElement;
    component.parentForm = new UntypedFormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set selected state', () => {
    component.setSelected(true);
    expect(component.isSelected).toBe(true);
    component.setSelected(false);
    expect(component.isSelected).toBe(false);
  });

  const renderChild = (type: string, dimensions: Partial<DimensionProperties>): HTMLElement => {
    component.element = {
      type,
      dimensions: {
        width: 100,
        height: 30,
        isWidthFixed: true,
        isHeightFixed: false,
        minHeight: null,
        maxHeight: null,
        ...dimensions
      }
    } as ToggleButtonElement;
    fixture.detectChanges();
    return (fixture.nativeElement as HTMLElement).querySelector('.gap-box > *') as HTMLElement;
  };

  /* The children are not declared here, so a child's host is empty and whatever height it has comes from
     the gap alone: every kind is stretched to a fixed height and to a minimum height (#1619). Centred,
     as the gap used to hold them, an empty host was 0px tall. */
  it.each(['drop-list', 'toggle-button', 'button', 'checkbox', 'dropdown'])(
    'should stretch a %s to the height of its gap',
    type => {
      expect(renderChild(type, { isHeightFixed: true, height: 50 }).getBoundingClientRect().height).toBe(50);
      expect(renderChild(type, { minHeight: 50 }).getBoundingClientRect().height).toBe(50);
    }
  );

  /* What a child does in a gap hangs on these inputs; that they exist on the child is the build's to check. */
  it.each([
    { type: 'toggle-button', input: 'clozeContext' },
    { type: 'button', input: 'clozeContext' },
    { type: 'drop-list', input: 'inGap' }
  ])('should tell a $type that it stands in a gap', ({ type, input }) => {
    const host = renderChild(type, {}) as HTMLElement & Record<string, unknown>;

    expect(host[input]).toBe(true);
  });

  it('should give every child the normal line height of its font', () => {
    (fixture.nativeElement as HTMLElement).style.lineHeight = '36px';

    expect(getComputedStyle(renderChild('button', {})).lineHeight).toBe('normal');
  });
});

describe('ClozeChildOverlayComponent with a text field', () => {
  let fixture: ComponentFixture<ClozeChildOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClozeChildOverlayComponent, TextFieldSimpleComponent],
      imports: [ReactiveFormsModule],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ClozeChildOverlayComponent);
    /* The line height of a cloze paragraph at its defaults (180% of 20px). It is taller than the input,
       which is what pushed a field out of a lower gap; at the browser's default nothing would. */
    (fixture.nativeElement as HTMLElement).style.lineHeight = '36px';
  });

  const renderField = (dimensions: Partial<DimensionProperties>): { box: DOMRect; input: DOMRect } => {
    const element = new TextFieldSimpleElement({
      type: 'text-field-simple',
      id: 'field',
      alias: 'field'
    } as Partial<TextFieldSimpleProperties>);
    element.dimensions = { ...element.dimensions, ...dimensions };
    fixture.componentInstance.element = element;
    fixture.componentInstance.parentForm = new UntypedFormGroup({ field: new UntypedFormControl('') });
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    return {
      box: (host.querySelector('.gap-box') as HTMLElement).getBoundingClientRect(),
      input: (host.querySelector('input') as HTMLElement).getBoundingClientRect()
    };
  };

  /* One height below and one above the height an <input> gives itself, so a field that keeps its own
     height fails either way (#1619). */
  it.each([20, 50])('should make the input fill a gap fixed at %ipx', height => {
    const { box, input } = renderField({ isHeightFixed: true, height });

    expect(input.height).toBe(height);
    expect(input.top).toBe(box.top);
    expect(input.bottom).toBe(box.bottom);
  });

  it('should make the input fill its gap when the height is not fixed', () => {
    const { box, input } = renderField({ isHeightFixed: false });

    expect(input.top).toBe(box.top);
    expect(input.bottom).toBe(box.bottom);
  });

  it.each<{ label: string; limit: Partial<DimensionProperties>; height: number }>([
    { label: 'minimum', limit: { minHeight: 50 }, height: 50 },
    { label: 'maximum', limit: { maxHeight: 20 }, height: 20 }
  ])('should make the input as tall as a $label height of $height px', ({ limit, height }) => {
    const { box, input } = renderField({ isHeightFixed: false, ...limit });

    expect(input.height).toBe(height);
    expect(input.top).toBe(box.top);
    expect(input.bottom).toBe(box.bottom);
  });
});

/* A child that asks for `height: 100%` of its host, as four of the six do: the gap has to outweigh that,
   or a minimum height never reaches it (#1619). */
describe('ClozeChildOverlayComponent with a button', () => {
  let fixture: ComponentFixture<ClozeChildOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClozeChildOverlayComponent, ButtonComponent, MockPointerEventTooltipDirective],
      imports: [MatButtonModule, TranslateModule.forRoot()],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ClozeChildOverlayComponent);
  });

  it('should stretch the button to a minimum height', () => {
    const element = new ButtonElement({
      type: 'button',
      id: 'knopf',
      alias: 'knopf',
      label: 'Wort'
    } as Partial<ButtonProperties>);
    element.dimensions = { ...element.dimensions, isHeightFixed: false, minHeight: 50 };
    fixture.componentInstance.element = element;
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;

    expect((host.querySelector('aspect-button') as HTMLElement).getBoundingClientRect().height).toBe(50);
    expect((host.querySelector('button') as HTMLElement).getBoundingClientRect().height).toBe(50);
  });
});
