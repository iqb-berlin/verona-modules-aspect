import {
  AfterViewInit, booleanAttribute, Directive, ElementRef, Input, NgZone, OnChanges, OnDestroy, Renderer2
} from '@angular/core';

/** A text fragment as it was measured: its box, and how far down the next line of its container starts. */
interface TextFragment {
  rect: DOMRect;
  advance: number;
}

/**
 * Puts the control of an option -- the radio dot, the checkbox -- on the middle of the FIRST LINE of
 * its label, whatever that line contains.
 *
 * The stylesheet cannot express this. It aligns the two at the top and pushes the label down by
 * `calc((state-layer-size - 20px) / 2)`, which centres the control on a line exactly 20px high and on
 * nothing else. A line holding a fraction is 42px high: the label sinks inside it while the control
 * stays put, so the dot ends up next to the numerator of `15/100` instead of next to the fraction bar
 * (#960, measured at 8.5px off). The same arithmetic is wrong for any font size other than 20px.
 *
 * Measuring the line keeps what #873 asked for -- the control belongs to the first line, not to the
 * middle of a multi-line label -- and gets the case #960 complains about right as a consequence: an
 * option that IS a fraction has one line, so its middle is the fraction's middle.
 *
 * Layout is left as the stylesheet builds it; only the control is nudged, by the difference between
 * where it sits and where the line's middle is. For a plain text line that difference is under half a
 * pixel, which is why nothing textual moves.
 *
 * Control and label do not have to sit together. Where they do -- an option field, a checkbox -- both
 * are found below the host. Where they do not, the label is handed in as an element
 * (`firstLineAlignedControlLabel`): a likert row keeps its row label and its radio buttons in separate
 * cells of one grid, and only the caller knows which cell belongs to which (#1371). The measurement
 * itself does not care, since it compares two rectangles of the viewport.
 */
@Directive({
  selector: '[firstLineAlignedControl]',
  standalone: false
})
export class FirstLineAlignedControlDirective implements AfterViewInit, OnChanges, OnDestroy {
  /** Off when the option is centred on its whole label instead (`verticalButtonAlignment`). */
  @Input({ transform: booleanAttribute }) firstLineAlignedControl: boolean = true;

  /**
   * Where the label is, for the case that it is not inside the host: the likert row puts control and
   * row label in separate grid cells, so nothing can be found by looking down from either of them.
   * Given an element, that element IS the label -- there is no `.mdc-label` to search for in it.
   */
  @Input() firstLineAlignedControlLabel?: HTMLElement;

  private static readonly CONTROL_SELECTOR = '.mdc-radio, .mdc-checkbox';
  private static readonly LABEL_SELECTOR = '.mdc-label';

  /** Below this the nudge is noise from sub-pixel layout, not a misalignment worth a style write. */
  private static readonly THRESHOLD_PX = 0.5;

  private observer?: ResizeObserver;
  private viewReady = false;
  private destroyed = false;

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    private zone: NgZone
  ) {}

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.apply();
  }

  ngOnChanges(): void {
    if (this.viewReady) this.apply();
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.stopObserving();
  }

  private apply(): void {
    const control = this.control;
    if (!control) return;
    if (!this.firstLineAlignedControl) {
      this.stopObserving();
      this.renderer.removeStyle(control, 'margin-top');
      return;
    }
    this.startObserving();
    this.align();
    /* The KaTeX web fonts a formula is laid out with arrive after the first layout, and a line
       measured without them is too low. Outside Angular, like the observer: the continuation writes a
       style, and one change detection pass per option at startup buys nothing. `align` refuses once
       the option is centred or gone, which is what this promise cannot be told. */
    this.zone.runOutsideAngular(() => {
      document.fonts.ready.then(() => this.align());
    });
  }

  private startObserving(): void {
    const label = this.label;
    if (this.observer || !label) return;
    /* Reflows -- a resized section, a rewrapped option -- change which content the first line holds.
       Outside Angular: this writes a style, it does not change the model. */
    this.zone.runOutsideAngular(() => {
      this.observer = new ResizeObserver(() => this.align());
      this.observer.observe(label);
    });
  }

  private stopObserving(): void {
    this.observer?.disconnect();
    this.observer = undefined;
  }

  private align(): void {
    if (this.destroyed || !this.firstLineAlignedControl) return;
    const control = this.control;
    const label = this.label;
    if (!control || !label) return;

    const line = FirstLineAlignedControlDirective.firstLineBox(label);
    if (!line) return;

    const box = control.getBoundingClientRect();
    const offset = (line.top + line.bottom) / 2 - (box.top + box.height / 2);
    if (Math.abs(offset) < FirstLineAlignedControlDirective.THRESHOLD_PX) return;

    /* Added to what is already set, so repeated measurements converge instead of oscillating. */
    const current = parseFloat(control.style.marginTop) || 0;
    this.renderer.setStyle(control, 'margin-top', `${Math.round((current + offset) * 10) / 10}px`);
  }

  private get control(): HTMLElement | null {
    return this.elementRef.nativeElement.querySelector(FirstLineAlignedControlDirective.CONTROL_SELECTOR);
  }

  private get label(): HTMLElement | null {
    return this.firstLineAlignedControlLabel ??
      this.elementRef.nativeElement.querySelector(FirstLineAlignedControlDirective.LABEL_SELECTOR);
  }

  /**
   * Top and bottom of the label's first line, formulas included.
   *
   * Two kinds of box go into that decision, and they do different work:
   *
   * - the label's first TEXT LINE is the base. Which of the fragments up there is that line is decided
   *   by width, not by height or position: a superscript sits higher than the text it belongs to and
   *   is just as tall, so picking the topmost fragment would stretch the line up to it and drag the
   *   control along -- options with a `5^2` in them would then sit lower than their neighbours.
   * - a formula or an image (an atomic inline box) EXTENDS the line it sits on, which is what puts the
   *   control on the fraction bar rather than on the numerator. Where there is no text at all, those
   *   boxes ARE the line -- an option that is nothing but a formula.
   *
   * The line is then everything the anchor -- the middle of the topmost of those two -- passes
   * through. A fraction reaches far above and below it and is taken in; the second line of a wrapped
   * text sits below it and is left out.
   */
  private static firstLineBox(label: HTMLElement): { top: number, bottom: number } | null {
    const textFragments: TextFragment[] = [];
    const boxRects: DOMRect[] = [];
    FirstLineAlignedControlDirective.collectRects(label, textFragments, boxRects);

    const candidates = [...boxRects.filter(rect => rect.height > 0)];
    const baseLine = FirstLineAlignedControlDirective.firstTextLine(textFragments);
    if (baseLine) candidates.push(baseLine);
    if (!candidates.length) return null;

    const anchor = candidates.reduce((highest, rect) => (rect.top < highest.top ? rect : highest));
    const middle = anchor.top + anchor.height / 2;

    const line = candidates.filter(rect => rect.top <= middle && rect.bottom >= middle);
    if (!line.length) return null;
    return {
      top: Math.min(...line.map(rect => rect.top)),
      bottom: Math.max(...line.map(rect => rect.bottom))
    };
  }

  /**
   * The widest fragment on the first line -- the running text, as opposed to a raised or lowered piece
   * inside it.
   *
   * What separates the first line from the second is the LINE ADVANCE, not whether two boxes overlap.
   * A fragment's box is the font's, and it is taller than the line it sits on whenever the line height
   * is the smaller of the two; Material sets a line height of its own on the option label, so in a
   * wrapped option the boxes of line 1 and line 2 overlap -- 74-101 against 94-121 at font-size 20,
   * measured. Any-overlap admitted line 2, and since a first line ending in a space is often the
   * shorter one ("Test 1" before an unbroken run of text), the widest fragment WAS line 2: the control
   * sat one line too low, and `verticalButtonAlignment: 'auto'` came out looking like 'center' (#1366).
   *
   * Measuring the advance instead of the overlap also keeps what a raised piece needs. A superscript is
   * the TOPMOST fragment of its line, so the rule has to reach down from it far enough to still see the
   * running text: one advance does, whatever the raising -- while the middle of the superscript, the
   * other candidate for a limit, sinks below the running text's top as soon as it is raised by more
   * than a third of the font size, and then the line would be the superscript alone and the control
   * would land above the text it belongs to.
   */
  private static firstTextLine(fragments: TextFragment[]): DOMRect | null {
    const usable = fragments.filter(fragment => fragment.rect.height > 0);
    if (!usable.length) return null;

    const topmost = usable.reduce((highest, f) => (f.rect.top < highest.rect.top ? f : highest));
    const nextLine = topmost.rect.top + topmost.advance;
    return usable
      .filter(fragment => fragment.rect.top < nextLine)
      .map(fragment => fragment.rect)
      .reduce((widest, rect) => (rect.width > widest.width ? rect : widest));
  }

  /**
   * How far down the next line starts: the line height of the fragment's BLOCK container, the box that
   * lays the lines out. Not the line height of an inline element the fragment happens to sit in -- a
   * superscript carries a smaller one of its own, and reaching only that far down from it would leave
   * the running text on the other side of the limit.
   *
   * `line-height: normal` computes to the keyword rather than to a length; the fragment's own box is
   * then the best available estimate of what the browser advances by.
   */
  private static lineAdvance(node: Node | null, rect: DOMRect): number {
    let element = node instanceof Element ? node : node?.parentElement ?? null;
    while (element && window.getComputedStyle(element).display === 'inline') {
      element = element.parentElement;
    }
    if (!element) return rect.height;
    return parseFloat(window.getComputedStyle(element).lineHeight) || rect.height;
  }

  /**
   * Text is measured per line fragment, an atomic inline box (a formula, an image) by its own box.
   * A plain `inline` element is descended into instead: spanning several lines, its box would cover
   * all of them.
   *
   * `Element`, not `HTMLElement`, and MathML or SVG is taken as one box whatever it computes to: a
   * formula that kept its stored KaTeX markup is a `<math>` element, and asking for HTMLElement
   * measured those labels as empty, which left them at the old position (`MathFormulaMarkup.contentFor`
   * returns the stored markup whenever it has no LaTeX to rebuild from, or a reader's mark sits inside
   * the formula).
   */
  private static readonly HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';

  private static collectRects(node: Node, textFragments: TextFragment[], boxRects: DOMRect[]): void {
    node.childNodes.forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        if (!child.textContent?.trim()) return;
        const range = document.createRange();
        range.selectNodeContents(child);
        /* The advance belongs to the element the fragment is laid out in: a superscript carries its own
           line-height, and the label's would not describe the text inside a `<p>` of its own either. */
        Array.from(range.getClientRects()).forEach(rect => textFragments.push({
          rect, advance: FirstLineAlignedControlDirective.lineAdvance(child.parentElement, rect)
        }));
        return;
      }
      if (!(child instanceof Element)) return;
      const display = window.getComputedStyle(child).display;
      if (display === 'none') return;
      if (child.namespaceURI !== FirstLineAlignedControlDirective.HTML_NAMESPACE) {
        boxRects.push(child.getBoundingClientRect());
        return;
      }
      if (display === 'inline' && child.childNodes.length) {
        FirstLineAlignedControlDirective.collectRects(child, textFragments, boxRects);
        return;
      }
      if (display.startsWith('inline')) {
        boxRects.push(child.getBoundingClientRect());
        return;
      }
      FirstLineAlignedControlDirective.collectRects(child, textFragments, boxRects);
    });
  }
}
