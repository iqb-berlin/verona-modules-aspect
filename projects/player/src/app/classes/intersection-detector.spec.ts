import { IntersectionDetector } from './intersection-detector';

class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  targets: Element[] = [];
  disconnected = false;

  constructor(private callback: IntersectionObserverCallback) {
    FakeIntersectionObserver.instances.push(this);
  }

  static get last(): FakeIntersectionObserver {
    return FakeIntersectionObserver.instances[FakeIntersectionObserver.instances.length - 1];
  }

  observe(target: Element): void {
    this.targets.push(target);
  }

  unobserve(target: Element): void {
    this.targets = this.targets.filter(observed => observed !== target);
  }

  disconnect(): void {
    this.disconnected = true;
    this.targets = [];
  }

  reportIntersection(target: Element): void {
    this.callback(
      [{ target: target, isIntersecting: true } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver
    );
  }
}

describe('IntersectionDetector', () => {
  let detector: IntersectionDetector;
  let element: HTMLElement;

  beforeEach(() => {
    FakeIntersectionObserver.instances = [];
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
    element = document.createElement('div');
    detector = new IntersectionDetector(document, '0px');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should report the id of an intersecting element', () => {
    const reported: (string | null)[] = [];
    detector.intersecting.subscribe(id => reported.push(id));

    detector.observe(element, 'element_1');
    FakeIntersectionObserver.last.reportIntersection(element);

    expect(reported).toEqual(['element_1']);
  });

  it('should report an intersection of an element it has no id for', () => {
    const reported: (string | null)[] = [];
    detector.intersecting.subscribe(id => reported.push(id));

    detector.observe(element);
    FakeIntersectionObserver.last.reportIntersection(element);

    expect(reported).toEqual([null]);
  });

  it('should stop observing an element by id', () => {
    detector.observe(element, 'element_1');
    detector.unobserve('element_1');

    expect(FakeIntersectionObserver.last.targets).toEqual([]);
  });

  it('should disconnect the observer, forget its elements and complete on destroy', () => {
    let completed = false;
    detector.intersecting.subscribe({ complete: () => { completed = true; } });
    detector.observe(element, 'element_1');

    detector.destroy();

    expect(FakeIntersectionObserver.last.disconnected).toBe(true);
    expect(detector.elements).toEqual([]);
    expect(completed).toBe(true);
  });
});
