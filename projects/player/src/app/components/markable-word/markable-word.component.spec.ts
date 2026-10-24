import {
  ComponentFixture, fakeAsync, TestBed, tick
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BehaviorSubject, config, Subject } from 'rxjs';
import { MarkingRange } from 'common/models/marking-data';
import { NativeEventService } from 'player/src/app/services/native-event.service';
import {
  MarkableDelimiterComponent
} from 'player/src/app/components/markable-delimiter/markable-delimiter.component';
import { MarkableWordComponent } from './markable-word.component';

describe('MarkableWordComponent', () => {
  let component: MarkableWordComponent;
  let fixture: ComponentFixture<MarkableWordComponent>;
  let mouseUp: Subject<MouseEvent>;
  let colorChanges: (string | null)[];

  const word = (): HTMLElement => fixture.debugElement.query(By.css('span')).nativeElement;

  const initComponent = (markColor: string | undefined,
                         markingRange: BehaviorSubject<MarkingRange | null> | null = null,
                         contentNode: Node | null = null): void => {
    component.id = 1;
    component.text = contentNode ? '' : 'ipsum';
    component.contentNode = contentNode;
    component.markColor = markColor;
    component.markingRange = markingRange;
    component.colorChange.subscribe(color => colorChanges.push(color));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    mouseUp = new Subject<MouseEvent>();
    colorChanges = [];

    await TestBed.configureTestingModule({
      declarations: [MarkableWordComponent, MarkableDelimiterComponent],
      providers: [{ provide: NativeEventService, useValue: { mouseUp: mouseUp.asObservable() } }]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MarkableWordComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    initComponent(undefined);

    expect(component).toBeTruthy();
  });

  it('should show its text', () => {
    initComponent(undefined);

    expect(word().textContent).toBe('ipsum');
  });

  /* A formula is handed over as a node, because its markup does not survive being split into words. */
  it('should show a handed over node instead of text', () => {
    const formula = document.createElement('aspect-nodeview-math-formula');
    formula.innerHTML = '<span class="ML__latex">x</span>';

    initComponent('yellow', null, formula);

    expect(word().firstElementChild).toBe(formula);
    expect(formula.innerHTML).toBe('<span class="ML__latex">x</span>');
  });

  it('should mark a handed over node like a word', () => {
    const formula = document.createElement('aspect-nodeview-math-formula');
    initComponent('yellow', null, formula);

    word().click();
    fixture.detectChanges();

    expect(colorChanges).toEqual(['#f9f871']);
    expect(word().style.backgroundColor).toBe('rgb(249, 248, 113)');
  });

  it('should ignore clicks without an active marking colour', () => {
    initComponent(undefined);

    word().click();

    expect(colorChanges).toEqual([]);
  });

  it('should ignore clicks while marking is switched off', () => {
    initComponent('none');

    word().click();

    expect(colorChanges).toEqual([]);
  });

  it('should mark the word in the selected colour', () => {
    initComponent('yellow');

    word().click();
    fixture.detectChanges();

    expect(component.color).toBe('#f9f871');
    expect(colorChanges).toEqual(['#f9f871']);
    expect(word().style.backgroundColor).toBe('rgb(249, 248, 113)');
  });

  it('should unmark a word that is already marked in the selected colour', () => {
    initComponent('yellow');
    component.color = '#f9f871';

    word().click();

    expect(component.color).toBeNull();
    expect(colorChanges).toEqual([null]);
  });

  it('should overwrite a marking in another colour', () => {
    initComponent('turquoise');
    component.color = '#f9f871';

    word().click();

    expect(component.color).toBe('#9de8eb');
  });

  it('should mark itself as active for an active marking colour', () => {
    initComponent('yellow');

    expect(word().classList).toContain('is-active');
  });

  it('should start a marking range on the first click', () => {
    const markingRange = new BehaviorSubject<MarkingRange | null>(null);
    initComponent('yellow', markingRange);

    word().click();

    expect(markingRange.value).toEqual({ first: 1, second: null });
  });

  it('should close a started marking range on the next click', () => {
    const markingRange = new BehaviorSubject<MarkingRange | null>({ first: 0, second: null });
    initComponent('yellow', markingRange);

    word().click();

    expect(markingRange.value).toEqual({ first: 0, second: 1 });
  });

  it('should mark itself as selected while the range is being started', () => {
    const markingRange = new BehaviorSubject<MarkingRange | null>({ first: 1, second: null });
    initComponent('yellow', markingRange);

    expect(word().classList).toContain('is-selected-yellow');
  });

  it('should mark itself when it lies within the closed range', () => {
    const markingRange = new BehaviorSubject<MarkingRange | null>(null);
    initComponent('yellow', markingRange);

    markingRange.next({ first: 0, second: 2 });

    expect(component.color).toBe('#f9f871');
    expect(colorChanges).toEqual(['#f9f871']);
  });

  it('should mark itself for a range that was selected backwards', () => {
    const markingRange = new BehaviorSubject<MarkingRange | null>(null);
    initComponent('yellow', markingRange);

    markingRange.next({ first: 3, second: 0 });

    expect(component.color).toBe('#f9f871');
  });

  it('should stay unmarked outside the range', () => {
    const markingRange = new BehaviorSubject<MarkingRange | null>(null);
    initComponent('yellow', markingRange);

    markingRange.next({ first: 2, second: 4 });

    expect(component.color).toBeUndefined();
    expect(colorChanges).toEqual([]);
  });

  it('should unmark words within the range in delete mode', () => {
    const markingRange = new BehaviorSubject<MarkingRange | null>(null);
    initComponent('delete', markingRange);
    component.color = '#f9f871';

    markingRange.next({ first: 0, second: 2 });

    expect(component.color).toBeNull();
    expect(colorChanges).toEqual([null]);
  });

  it('should end the range selection when the mouse is released', fakeAsync(() => {
    const markingRange = new BehaviorSubject<MarkingRange | null>(null);
    initComponent('yellow', markingRange);
    word().click();

    mouseUp.next(new MouseEvent('mouseup'));
    tick();

    expect(markingRange.value).toBeNull();
  }));

  it('should not report an error when it is destroyed before the mouse is released', fakeAsync(() => {
    const markingRange = new BehaviorSubject<MarkingRange | null>(null);
    initComponent('yellow', markingRange);
    word().click();

    const unhandledErrors: unknown[] = [];
    const restoreOnUnhandledError = config.onUnhandledError;
    config.onUnhandledError = (error: unknown) => { unhandledErrors.push(error); };
    try {
      fixture.destroy();
      tick();
    } finally {
      config.onUnhandledError = restoreOnUnhandledError;
    }

    expect(unhandledErrors).toEqual([]);
  }));

  /*
   * Releasing the mouse ends the range selection deferred by a timeout. A teardown in between
   * would otherwise write into the marking range of a text this component has already left.
   */
  it('should not end the range selection after it has been destroyed', fakeAsync(() => {
    const markingRange = new BehaviorSubject<MarkingRange | null>(null);
    initComponent('yellow', markingRange);
    word().click();
    mouseUp.next(new MouseEvent('mouseup'));

    fixture.destroy();
    tick();

    expect(markingRange.value).toEqual({ first: 1, second: null });
  }));

  it('should stop reacting on range changes after destruction', () => {
    const markingRange = new BehaviorSubject<MarkingRange | null>(null);
    initComponent('yellow', markingRange);

    fixture.destroy();
    markingRange.next({ first: 0, second: 2 });

    expect(colorChanges).toEqual([]);
  });

  describe('before a delimiter', () => {
    let line: HTMLElement | undefined;

    afterEach(() => line?.remove());

    /*
     * An italic last letter reaches over the right edge of its word into the following delimiter, whose
     * marking colour covers it if the delimiter is painted later (#1613). Moved onto the end of the word, the
     * delimiter shows which of the two is painted last: the topmost element at a point is the one painted
     * last there. The point lies in a padding without letters, because a point on a letter finds the word
     * in either order.
     */
    it('should be painted over the following delimiter', () => {
      initComponent(undefined);
      component.color = '#f9f871';
      fixture.detectChanges();
      const delimiterFixture = TestBed.createComponent(MarkableDelimiterComponent);
      delimiterFixture.componentInstance.text = ', ';
      delimiterFixture.componentInstance.color = '#f9f871';
      delimiterFixture.componentInstance.neighbourColor = '#f9f871';
      delimiterFixture.detectChanges();
      const delimiter = delimiterFixture.nativeElement as HTMLElement;
      // TestBed renders each host as a div; in the player both are inline elements in a line of text
      fixture.nativeElement.style.display = 'inline';
      delimiter.style.display = 'inline';
      word().style.paddingRight = '10px';
      delimiter.style.marginLeft = '-8px';
      line = document.createElement('p');
      line.style.fontSize = '20px';
      line.append(fixture.nativeElement, delimiter);
      document.body.append(line);
      const wordBox = word().getBoundingClientRect();
      const x = wordBox.right - 4;
      const y = (wordBox.top + wordBox.bottom) / 2;
      expect(delimiter.getBoundingClientRect().left).toBeLessThan(x);

      const topmost = document.elementFromPoint(x, y);

      expect(word().contains(topmost)).toBe(true);
    });
  });
});
