import { ApplicationRef, EventEmitter, RendererFactory2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, Subject } from 'rxjs';
import { TextComponent } from 'common/components/text-group-elements/text/text.component';
import { MarkingRange } from 'common/models/marking-data';
import { MarkingPanelService } from 'player/src/app/services/marking-panel.service';
import { Markable } from 'player/src/app/models/markable.interface';
import { NativeEventService } from 'player/src/app/services/native-event.service';
import {
  MarkableDelimiterComponent
} from 'player/src/app/components/markable-delimiter/markable-delimiter.component';
import {
  MarkableWordComponent
} from 'player/src/app/components/markable-word/markable-word.component';
import {
  MarkablesContainerComponent
} from 'player/src/app/components/markables-container/markables-container.component';
import { MarkableSupport } from './markable-support';

describe('MarkableSupport', () => {
  let support: MarkableSupport;
  let applicationRef: ApplicationRef;
  let textContainer: HTMLElement;
  let elementComponent: TextComponent;
  let viewCountBefore: number;
  let mouseUp: Subject<MouseEvent>;

  const words = (): Element[] => Array.from(textContainer.querySelectorAll('aspect-markable-word'));

  const FORMULA_MARKUP = '<span class="ML__latex"><span class="ML__base">x</span>' +
    '<span class="ML__msup">2</span></span>';

  const formula = (): Element | null => textContainer.querySelector('aspect-nodeview-math-formula');

  const span = (word: Element): HTMLElement => word.querySelector('span') as HTMLElement;

  const markedWords = (): string[] => words()
    .filter(word => span(word).style.backgroundColor)
    .map(word => word.textContent as string);

  /* A stored text with a formula, as the player renders it: the formula node holds the markup
   * MathFormulaMarkup built from its LaTeX. */
  const givenTextWithFormula = (): void => {
    textContainer.innerHTML =
      `Lorem <aspect-nodeview-math-formula formula="x^2">${FORMULA_MARKUP}</aspect-nodeview-math-formula> dolor`;
  };

  beforeEach(async () => {
    mouseUp = new Subject<MouseEvent>();

    await TestBed.configureTestingModule({
      declarations: [MarkablesContainerComponent, MarkableWordComponent, MarkableDelimiterComponent],
      providers: [{ provide: NativeEventService, useValue: { mouseUp: mouseUp.asObservable() } }]
    })
      .compileComponents();

    applicationRef = TestBed.inject(ApplicationRef);

    textContainer = document.createElement('div');
    textContainer.textContent = 'Lorem ipsum dolor';
    document.body.appendChild(textContainer);

    elementComponent = {
      textContainerRef: { nativeElement: textContainer },
      selectedColor: new BehaviorSubject<string | undefined>('yellow'),
      markingRange: new BehaviorSubject<MarkingRange | null>(null),
      elementValueChanged: new EventEmitter(),
      elementModel: { id: 'text_1', markingPanels: [] }
    } as unknown as TextComponent;

    support = new MarkableSupport(
      TestBed.inject(RendererFactory2).createRenderer(null, null),
      applicationRef,
      TestBed.inject(MarkingPanelService)
    );
    viewCountBefore = applicationRef.viewCount;
  });

  afterEach(() => {
    textContainer.remove();
  });

  it('should show a markable word per word of the text', () => {
    support.createMarkables([], elementComponent);
    applicationRef.tick();

    expect(words().length).toBe(3);
  });

  it('should attach a view for the created markables', () => {
    support.createMarkables([], elementComponent);

    expect(applicationRef.viewCount).toBe(viewCountBefore + 1);
  });

  it('should detach the created views on destruction', () => {
    support.createMarkables([], elementComponent);
    applicationRef.tick();

    support.destroy();

    expect(applicationRef.viewCount).toBe(viewCountBefore);
  });

  it('should destroy the markable words on destruction', () => {
    support.createMarkables([], elementComponent);
    applicationRef.tick();

    support.destroy();

    expect(words().length).toBe(0);
  });

  it('should show one markable word for a formula', () => {
    givenTextWithFormula();

    support.createMarkables([], elementComponent);
    applicationRef.tick();

    expect(words().length).toBe(3);
  });

  it('should keep the markup of a formula inside its markable word', () => {
    givenTextWithFormula();

    support.createMarkables([], elementComponent);
    applicationRef.tick();

    expect(formula()?.closest('aspect-markable-word')).toBe(words()[1]);
    expect(formula()?.innerHTML).toBe(FORMULA_MARKUP);
  });

  it('should not turn the glyphs of a formula into markables', () => {
    givenTextWithFormula();

    support.createMarkables([], elementComponent);
    applicationRef.tick();

    expect(formula()?.querySelector('aspect-markable-word')).toBeNull();
  });

  /* One id per formula, no matter how much markup it renders to: that is what keeps the ids of stored
   * answers independent of the formula renderer of the day. */
  it('should count a formula as one id, so the words behind it keep theirs', () => {
    givenTextWithFormula();

    support.createMarkables(['2-2-#f9f871'], elementComponent);
    applicationRef.tick();

    expect(markedWords()).toEqual(['dolor']);
  });

  it('should restore a stored mark on a formula', () => {
    givenTextWithFormula();

    support.createMarkables(['1-1-#f9f871'], elementComponent);
    applicationRef.tick();

    expect(span(formula()?.closest('aspect-markable-word') as Element).style.backgroundColor)
      .toBe('rgb(249, 248, 113)');
  });

  it('should leave a formula without markup out of the markables', () => {
    textContainer.innerHTML =
      'Lorem <aspect-nodeview-math-formula formula=""><span></span></aspect-nodeview-math-formula> dolor';

    support.createMarkables(['1-1-#f9f871'], elementComponent);
    applicationRef.tick();

    expect(words().length).toBe(2);
    expect(markedWords()).toEqual(['dolor']);
  });

  it('should mark a formula as a whole when it is clicked', () => {
    givenTextWithFormula();
    elementComponent.markingRange = null;
    const values: Markable[][] = [];
    elementComponent.elementValueChanged.subscribe(value => values.push(value.value as Markable[]));
    support.createMarkables([], elementComponent);
    applicationRef.tick();

    span(words()[1]).click();

    expect(values.length).toBe(1);
    expect(values[0].map(markable => markable.color)).toEqual([null, '#f9f871', null]);
  });

  it('should mark a formula that lies within a selected range', () => {
    givenTextWithFormula();
    support.createMarkables([], elementComponent);
    applicationRef.tick();

    span(words()[0]).click();
    span(words()[2]).click();
    applicationRef.tick();

    expect(markedWords()).toEqual(['Lorem', 'x2', 'dolor']);
  });

  /*
   * Destroying the words is what lets them clean up after themselves. Before the containers were
   * destroyed here, MarkableWordComponent.ngOnDestroy never ran outside of tests, so a range
   * selection waiting for the mouse to be released outlived its text.
   */
  it('should end a pending range selection of its words on destruction', () => {
    support.createMarkables([], elementComponent);
    applicationRef.tick();
    (words()[0].querySelector('span') as HTMLElement).click();
    expect(mouseUp.observed).toBeTruthy();

    support.destroy();

    expect(mouseUp.observed).toBeFalsy();
  });
});
