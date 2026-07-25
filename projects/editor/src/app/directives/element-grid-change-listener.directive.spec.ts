import {
  ElementGridChangeListenerDirective
} from 'editor/src/app/directives/element-grid-change-listener.directive';

describe('ElementGridChangeListenerDirective', () => {
  let directive: ElementGridChangeListenerDirective;
  let emitCount: number;

  beforeEach(() => {
    directive = new ElementGridChangeListenerDirective();
    emitCount = 0;
    directive.elementChanged.subscribe(() => {
      emitCount += 1;
    });
  });

  it('should emit elementChanged when inputs change', () => {
    directive.ngOnChanges();
    expect(emitCount).toBe(1);
  });

  it('should emit elementChanged on every change', () => {
    directive.ngOnChanges();
    directive.ngOnChanges();
    directive.ngOnChanges();
    expect(emitCount).toBe(3);
  });
});
