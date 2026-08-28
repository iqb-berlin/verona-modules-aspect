// eslint-disable-next-line max-classes-per-file
import { Component, ViewEncapsulation } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FirstLineAlignedControlDirective } from './first-line-aligned-control.directive';

/**
 * The directive measures rendered geometry, so the host reproduces the layout Material builds for an
 * option: a flex row, the control at the top, the label pushed down by the fixed padding the
 * stylesheet applies. TALL stands in for a formula -- an atomic inline box higher than a text line.
 * Its size comes from an unencapsulated style: encapsulated ones do not reach content written through
 * innerHTML, and a style ATTRIBUTE would not survive Angular's sanitizer.
 *
 * firstLineAlignedControl is set on the directive instance: property bindings on native elements in
 * spec-local host templates are rejected by the AOT compiler (NG8002).
 */
@Component({
  template: `
    <div class="field" firstLineAlignedControl>
      <div class="mdc-radio"></div>
      <label class="mdc-label"><span [innerHTML]="content"></span></label>
    </div>`,
  styles: [`
    .field { display: flex; align-items: flex-start; width: 320px; font: 20px/20px monospace; }
    .mdc-radio { flex: none; width: 40px; height: 40px; }
    .mdc-label { padding-top: 10px; }
    .tall { display: inline-block; width: 30px; height: 42px; }
  `],
  encapsulation: ViewEncapsulation.None,
  standalone: false
})
class TestHostComponent {
  content: string = '';
}

/** A formula's stand-in: 42px high, twice a text line. */
const TALL = '<span class="tall"></span>';

describe('FirstLineAlignedControlDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let directive: FirstLineAlignedControlDirective;

  const render = (content: string): void => {
    fixture.componentInstance.content = content;
    fixture.detectChanges();
    directive.ngOnChanges();
  };

  const control = (): HTMLElement => fixture.nativeElement.querySelector('.mdc-radio');
  const label = (): HTMLElement => fixture.nativeElement.querySelector('.mdc-label');
  const formula = (): HTMLElement => label().querySelector('.tall') as HTMLElement;
  const centre = (element: Element): number => {
    const rect = element.getBoundingClientRect();
    return rect.top + rect.height / 2;
  };
  const marginTop = (): number => parseFloat(control().style.marginTop || '0');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestHostComponent, FirstLineAlignedControlDirective]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    directive = fixture.debugElement.query(By.directive(FirstLineAlignedControlDirective))
      .injector.get(FirstLineAlignedControlDirective);
  });

  it('should leave a plain text line where the stylesheet put it', () => {
    render('Eine gewöhnliche Option');
    /* The fixed padding is right for a 20px line, so there is nothing to correct. */
    expect(Math.abs(marginTop())).toBeLessThan(1);
  });

  it('should centre the control on a label that is nothing but a formula', () => {
    render(TALL);
    expect(Math.abs(centre(control()) - centre(formula()))).toBeLessThan(1);
    /* Without the directive the control would sit at the top of the 42px box, not in its middle. */
    expect(marginTop()).toBeGreaterThan(5);
  });

  it('should take a formula into the first line when text stands next to it', () => {
    render(`Text ${TALL} dahinter`);
    const box = formula().getBoundingClientRect();
    expect(centre(control())).toBeGreaterThan(box.top);
    expect(centre(control())).toBeLessThan(box.bottom);
  });

  it('should stay on the first line of a wrapped text instead of centring on the whole label', () => {
    render('Eine lange Option, die über mehrere Zeilen läuft und deshalb mehrfach umbricht');
    const labelRect = label().getBoundingClientRect();
    expect(labelRect.height).toBeGreaterThan(40); // wirklich umgebrochen
    /* #873: the control belongs to the first line, and the label's middle lies far below it. */
    expect(centre(control())).toBeLessThan(labelRect.top + labelRect.height / 2 - 5);
  });

  /* #1366: with a line height below the font's own box the fragments of line 1 and line 2 overlap, and
     a first line ending in a space is the shorter of the two -- exactly the shape of a reported option.
     Picking the widest fragment among ALL overlapping ones then landed on line 2, one line too low. */
  it('should stay on the first line when the second one is wider', () => {
    render(`Ab ${'x'.repeat(40)}`);

    const range = document.createRange();
    range.selectNodeContents(label().querySelector('span')?.firstChild as Node);
    const [firstLine, secondLine] = Array.from(range.getClientRects());
    expect(secondLine.width).toBeGreaterThan(firstLine.width); // die Form, um die es geht
    expect(secondLine.top).toBeLessThan(firstLine.bottom); // die Boxen überlappen wirklich

    expect(Math.abs(centre(control()) - (firstLine.top + firstLine.height / 2))).toBeLessThan(1);
  });

  it('should ignore a formula that sits on a later line', () => {
    render(`Erste Zeile<br>${TALL}`);
    expect(centre(control())).toBeLessThan(formula().getBoundingClientRect().top);
  });

  /* The review found this one: the reference used to be the topmost TEXT fragment, so a formula on the
     first line with text below it aligned the control to the second line -- worse than before the
     directive existed. */
  it('should stay on a first line that holds nothing but a formula, with text below it', () => {
    render(`${TALL}<br>Zweite Zeile`);
    const box = formula().getBoundingClientRect();
    expect(centre(control())).toBeGreaterThan(box.top);
    expect(centre(control())).toBeLessThan(box.bottom);
  });

  /* Also from the review, though the other way round than it read there: a superscript raises the line
     and the running text sinks inside it, so the control has to sink with it. What must NOT happen is
     the line being stretched up to the superscript -- then the control lands above the text it belongs
     to, which is the very misalignment #960 is about. Measured against the running text, not against
     the size of the correction. */
  it('should sit on the running text of a line that carries a superscript', () => {
    render('Fläche von 5<sup>2</sup> Zentimetern');

    const range = document.createRange();
    const firstTextNode = label().querySelector('span')?.firstChild as Node;
    range.selectNodeContents(firstTextNode);
    const runningText = range.getClientRects()[0];

    expect(Math.abs(centre(control()) - (runningText.top + runningText.height / 2))).toBeLessThan(1);
  });

  /* The review of #1366 found this one. A superscript is the TOPMOST fragment of its line, so whatever
     separates line 1 from line 2 has to reach from the superscript down to the running text. Nesting
     raises it far enough that the superscript's own middle no longer does -- the line would then be the
     superscript alone and the control would sit above the text it belongs to, the misalignment #960 is
     about. Measured against the running text, as in the single-superscript case above. */
  it('should sit on the running text under a superscript raised out of the line', () => {
    render('Fläche von 5<sup><sup>2</sup></sup> Zentimetern');

    const range = document.createRange();
    range.selectNodeContents(label().querySelector('span')?.firstChild as Node);
    const runningText = range.getClientRects()[0];

    /* The shape this case is about: the raised fragment's middle has left the running text's box, so a
       rule anchored on that middle no longer sees the text. Measured on the fragment, not on the
       wrapping element, because that is what the directive collects. */
    const raised = document.createRange();
    raised.selectNodeContents(label().querySelector('sup sup')?.firstChild as Node);
    const raisedRect = raised.getClientRects()[0];
    expect(raisedRect.top + raisedRect.height / 2).toBeLessThan(runningText.top);

    expect(Math.abs(centre(control()) - (runningText.top + runningText.height / 2))).toBeLessThan(1);
  });

  /* Also from that review: with a line height well below the font's box the overlap of line 1 and line 2
     grows, and a rule that measures halves instead of the advance falls back into #1366. */
  it('should stay on the first line when the line height is far below the font size', () => {
    label().style.lineHeight = '10px';
    render(`Ab ${'x'.repeat(40)}`);

    const range = document.createRange();
    range.selectNodeContents(label().querySelector('span')?.firstChild as Node);
    const [firstLine, secondLine] = Array.from(range.getClientRects());
    expect(secondLine.width).toBeGreaterThan(firstLine.width);

    expect(Math.abs(centre(control()) - (firstLine.top + firstLine.height / 2))).toBeLessThan(1);
    label().style.lineHeight = '';
  });

  it('should measure a formula that kept its stored MathML', () => {
    /* Built as DOM, not through innerHTML: Angular's sanitizer strips MathML, while the player writes
       it through `safeResourceHTML`, which does not. MathML is no HTMLElement, and measuring only
       those left such labels unaligned. */
    render('');
    const math = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'math');
    math.innerHTML = '<mfrac><mn>15</mn><mn>100</mn></mfrac>';
    label().appendChild(math);
    directive.ngOnChanges();

    const box = math.getBoundingClientRect();
    expect(box.height).toBeGreaterThan(20); // der Browser setzt den Bruch wirklich zweizeilig
    /* 2px: the alignment stops correcting below half a pixel and rounds to a tenth. Unaligned the
       control would be some 11px off, so this still separates the two. */
    expect(Math.abs(centre(control()) - (box.top + box.height / 2))).toBeLessThan(2);
  });

  it('should drop its correction when the option is centred on the whole label instead', () => {
    render(TALL);
    expect(control().style.marginTop).not.toBe('');

    directive.firstLineAlignedControl = false;
    directive.ngOnChanges();
    expect(control().style.marginTop).toBe('');
  });

  /* The review's third finding: the pending `document.fonts.ready` continuation used to write a
     margin back onto an option that had meanwhile been switched to centred. */
  it('should write nothing once switched off, even from a late measurement', async () => {
    render(TALL);
    directive.firstLineAlignedControl = false;
    directive.ngOnChanges();

    await document.fonts.ready;
    await new Promise(resolve => { requestAnimationFrame(resolve); });

    expect(control().style.marginTop).toBe('');
  });

  it('should realign when the label rewraps', async () => {
    render(`Text, der zunächst in eine Zeile passt ${TALL}`);
    const beforeRewrap = marginTop();

    /* A narrower field pushes the formula onto the second line, which changes what the first line
       holds. The ResizeObserver reports that asynchronously, so this waits for real frames rather
       than virtual time. */
    (fixture.nativeElement.querySelector('.field') as HTMLElement).style.width = '60px';
    for (let frame = 0; frame < 30; frame++) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise(resolve => { requestAnimationFrame(resolve); });
      if (marginTop() !== beforeRewrap) break;
    }

    expect(centre(control())).toBeLessThan(formula().getBoundingClientRect().top);
  });
});

/**
 * The likert row's layout: control and label are cells of one grid, so neither can be found from the
 * other. The label is handed to the directive as an element instead (#1371).
 */
@Component({
  template: `
    <div class="row">
      <div class="row-label" #labelCell><span [innerHTML]="content"></span></div>
      <div class="button-cell" firstLineAlignedControl>
        <div class="mdc-radio"></div>
      </div>
    </div>`,
  styles: [`
    .row { display: grid; grid-template-columns: 200px 60px; width: 320px; font: 20px/20px monospace; }
    .row-label { place-self: start; }
    .button-cell { place-self: start; }
    .mdc-radio { width: 40px; height: 40px; }
    .tall { display: inline-block; width: 30px; height: 42px; }
  `],
  encapsulation: ViewEncapsulation.None,
  standalone: false
})
class GridHostComponent {
  content: string = '';
}

describe('FirstLineAlignedControlDirective with the label handed in', () => {
  let fixture: ComponentFixture<GridHostComponent>;
  let directive: FirstLineAlignedControlDirective;

  const control = (): HTMLElement => fixture.nativeElement.querySelector('.mdc-radio');
  const labelCell = (): HTMLElement => fixture.nativeElement.querySelector('.row-label');
  const formula = (): HTMLElement => labelCell().querySelector('.tall') as HTMLElement;
  const centre = (element: Element): number => {
    const rect = element.getBoundingClientRect();
    return rect.top + rect.height / 2;
  };

  const marginTop = (): number => parseFloat(control().style.marginTop || '0');

  const render = (content: string): void => {
    fixture.componentInstance.content = content;
    fixture.detectChanges();
    directive.firstLineAlignedControlLabel = labelCell();
    directive.ngOnChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GridHostComponent, FirstLineAlignedControlDirective]
    }).compileComponents();

    fixture = TestBed.createComponent(GridHostComponent);
    fixture.detectChanges();
    directive = fixture.debugElement.query(By.directive(FirstLineAlignedControlDirective))
      .injector.get(FirstLineAlignedControlDirective);
  });

  it('should measure the label of another grid cell', () => {
    render(`Anteil ${TALL} der Fläche`);
    /* The line the formula extends is 42px high, the control 40px and at the top of its own cell:
       without the handed-in label nothing would be measured and the margin would stay empty. */
    expect(Math.abs(centre(control()) - centre(formula()))).toBeLessThan(1);
    expect(control().style.marginTop).not.toBe('');
  });

  it('should centre the control on a row label that is nothing but a formula', () => {
    render(TALL);
    expect(Math.abs(centre(control()) - centre(formula()))).toBeLessThan(1);
    expect(control().style.marginTop).not.toBe('');
  });

  it('should pull the control up onto the first line of a wrapped row label', () => {
    render('Eine lange Zeilenbeschriftung, die über mehrere Zeilen läuft und deshalb umbricht');
    const labelRect = labelCell().getBoundingClientRect();
    expect(labelRect.height).toBeGreaterThan(40); // wirklich umgebrochen

    /* The first line is 20px high and the control is 40px: its middle has to move UP by 10px to meet
       the line's middle, which a control merely parked at the top of its cell never does. */
    const [firstLine] = Array.from(labelCell().querySelector('span')?.getClientRects() ?? []);
    expect(Math.abs(centre(control()) - (firstLine.top + firstLine.height / 2))).toBeLessThan(1);
    expect(marginTop()).toBeLessThan(-5);
  });
});
