import {
  ChangeDetectorRef, ElementRef, NgZone, SimpleChange
} from '@angular/core';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { DynamicRowsDirective } from './dynamic-rows.directive';

class FakeResizeObserver {
  static lastInstance: FakeResizeObserver | undefined;
  observedElements: Element[] = [];
  disconnected = false;
  private readonly callback: () => void;

  constructor(callback: () => void) {
    this.callback = callback;
    FakeResizeObserver.lastInstance = this;
  }

  observe(element: Element): void {
    this.observedElements.push(element);
  }

  unobserve(element: Element): void {
    this.observedElements = this.observedElements.filter(observed => observed !== element);
  }

  disconnect(): void {
    this.disconnected = true;
  }

  trigger(): void {
    this.callback();
  }
}

describe('DynamicRowsDirective', () => {
  let directive: DynamicRowsDirective;
  let element: HTMLTextAreaElement;
  let changeDetectorRef: SpyObj<ChangeDetectorRef>;
  let emittedRows: number[];

  beforeEach(() => {
    element = document.createElement('textarea');
    changeDetectorRef = createSpyObj<ChangeDetectorRef>(['detectChanges']);
    const zone = { run: <T>(fn: () => T): T => fn() } as unknown as NgZone;
    directive = new DynamicRowsDirective(new ElementRef(element), zone, changeDetectorRef);
    directive.fontSize = 20;
    directive.expectedCharactersCount = 100;

    emittedRows = [];
    directive.dynamicRowsChange.subscribe((rows: number) => emittedRows.push(rows));
  });

  afterEach(() => {
    element.remove();
    FakeResizeObserver.lastInstance = undefined;
  });

  it('should emit the row count derived from font size, character count and width', () => {
    directive.width = 250;
    directive.calculateDynamicRows();
    // 100 characters * (20 / 2) average char width / 250px width = 4 rows
    expect(emittedRows).toEqual([4]);
    expect(changeDetectorRef.detectChanges).toHaveBeenCalled();
  });

  it('should round the row count up', () => {
    directive.width = 300;
    directive.calculateDynamicRows();
    expect(emittedRows).toEqual([Math.ceil((100 * 10) / 300)]);
  });

  it('should not emit as long as no width has been measured', () => {
    directive.calculateDynamicRows();
    expect(emittedRows.length).toBe(0);
    expect(changeDetectorRef.detectChanges).not.toHaveBeenCalled();
  });

  it('should recalculate the rows when fontSize or expectedCharactersCount change', () => {
    directive.width = 100;
    directive.ngOnChanges({ fontSize: new SimpleChange(10, 20, false) });
    directive.ngOnChanges({ expectedCharactersCount: new SimpleChange(50, 100, false) });
    directive.ngOnChanges({});
    expect(emittedRows).toEqual([10, 10]);
  });

  it('should measure the width and recalculate when the observed element resizes', () => {
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    try {
      element.style.width = '250px';
      document.body.appendChild(element);
      directive.ngOnInit();
      const observer = FakeResizeObserver.lastInstance;
      expect(observer?.observedElements).toEqual([element]);

      observer?.trigger();
      expect(directive.width).toBe(element.offsetWidth);
      expect(emittedRows).toEqual([Math.ceil((100 * 10) / element.offsetWidth)]);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
