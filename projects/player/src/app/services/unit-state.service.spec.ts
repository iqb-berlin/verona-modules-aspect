import { TestBed } from '@angular/core/testing';
import { Response } from '@iqb/responses';
import { UnitStateService } from './unit-state.service';

class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  targets: Element[] = [];
  disconnected = false;

  constructor(private callback: IntersectionObserverCallback) {
    FakeIntersectionObserver.instances.push(this);
  }

  static get live(): FakeIntersectionObserver[] {
    return FakeIntersectionObserver.instances.filter(observer => !observer.disconnected);
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

describe('UnitStateService', () => {
  let service: UnitStateService;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnitStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get element by id', () => {
    const element1: Response & { alias: string } = {
      id: 'element_1', alias: 'element_1_alias', status: 'DISPLAYED', value: 'TEST1'
    };
    const element2: Response & { alias: string } = {
      id: 'element_2', alias: 'element_2_alias', status: 'DISPLAYED', value: 'TEST2'
    };
    service.elementCodes = [element1, element2];
    expect(service.getElementCodeById('element_1')).toEqual(element1);
  });

  it('should return undefined for a not registered element id', () => {
    const element1: Response & { alias: string } = {
      id: 'element_1', alias: 'element_1_alias', status: 'DISPLAYED', value: 'TEST1'
    };
    const element2: Response & { alias: string } = {
      id: 'element_2', alias: 'element_2_alias', status: 'DISPLAYED', value: 'TEST2'
    };
    service.elementCodes = [element1, element2];
    expect(service.getElementCodeById('element_3')).toBeUndefined();
  });

  it('should register an element', () => {
    service.elementCodes = [];
    const element = document.createElement('div');
    service.registerElementCode('element', 'elementAlias', 'TEST', element, 1);
    expect(service.elementCodes).toEqual([{
      id: 'element', alias: 'elementAlias', status: 'NOT_REACHED', value: 'TEST'
    }]);
  });

  it('elementCode of an element should change', () => new Promise<void>(done => {
    service.elementCodes = [{
      id: 'element_1', alias: 'elementAlias', status: 'NOT_REACHED', value: 'TEST1'
    }];
    service.elementCodeChanged
      .subscribe(code => {
        expect(code.status).toEqual('DISPLAYED');
        done();
      });
    service.changeElementCodeStatus({ id: 'element_1', status: 'DISPLAYED' });
  }));

  it('elementCode of an element should change', () => new Promise<void>(done => {
    service.elementCodes = [{
      id: 'element_1', alias: 'elementAlias', status: 'NOT_REACHED', value: 'TEST1'
    }];
    service.elementCodeChanged
      .subscribe(code => {
        expect(code.status).toEqual('VALUE_CHANGED');
        expect(code.value).toEqual('NEU');
        done();
      });
    service.changeElementCodeValue({ id: 'element_1', value: 'NEU' });
  }));

  it('presentedPagesProgress should be complete', () => {
    service.elementCodes = [];
    expect(service.presentedPagesProgress).toEqual('complete');
  });

  it('presentedPagesProgress should be none', () => {
    service.elementCodes = [];
    const element = document.createElement('div');
    service.registerElementCode('element', 'alias', 'TEST', element, 1);
    expect(service.presentedPagesProgress).toEqual('none');
  });

  it('presentedPagesProgress should be complete', () => {
    service.elementCodes = [];
    const element = document.createElement('div');
    service.registerElementCode('element', 'alias', 'TEST', element, 1);
    service.changeElementCodeStatus({ id: 'element', status: 'DISPLAYED' });
    expect(service.presentedPagesProgress).toEqual('complete');
  });

  it('presentedPagesProgress should be none', () => {
    service.elementCodes = [];
    const element = document.createElement('div');
    service.registerElementCode('element_1', 'alias1', 'TEST1', element, 1);
    service.registerElementCode('element_2', 'alias2', 'TEST2', element, 1);
    service.changeElementCodeStatus({ id: 'element_1', status: 'DISPLAYED' });
    expect(service.presentedPagesProgress).toEqual('none');
  });

  it('presentedPagesProgress should be some', () => {
    service.elementCodes = [];
    const element = document.createElement('div');
    service.registerElementCode('element_1', 'alias1', 'TEST1', element, 1);
    service.registerElementCode('element_2', 'alias2', 'TEST2', element, 2);
    service.changeElementCodeStatus({ id: 'element_1', status: 'DISPLAYED' });
    expect(service.presentedPagesProgress).toEqual('some');
  });

  it('presentedPagesProgress should be complete', () => {
    service.elementCodes = [];
    const element = document.createElement('div');
    service.registerElementCode('element_1', 'alias1', 'TEST1', element, 1);
    service.registerElementCode('element_2', 'alias2', 'TEST2', element, 2);
    service.changeElementCodeStatus({ id: 'element_1', status: 'DISPLAYED' });
    service.changeElementCodeStatus({ id: 'element_2', status: 'DISPLAYED' });
    expect(service.presentedPagesProgress).toEqual('complete');
  });

  it('presented page with index 1 should be added', () => new Promise<void>(done => {
    service.elementCodes = [];
    const element = document.createElement('div');
    service.registerElementCode('element_1', 'alias', 'TEST1', element, 1);
    service.pagePresented
      .subscribe(index => {
        expect(index).toEqual(1);
        done();
      });
    service.changeElementCodeStatus({ id: 'element_1', status: 'DISPLAYED' });
  }));

  it('presented page with index 1 should be added', () => new Promise<void>(done => {
    service.elementCodes = [];
    const element = document.createElement('div');
    service.registerElementCode('element_1', 'alias', 'TEST1', element, 1);
    service.pagePresented
      .subscribe(index => {
        expect(index).toEqual(1);
        done();
      });
    service.changeElementCodeValue({ id: 'element_1', value: 'NEU' });
  }));

  describe('intersection detection', () => {
    const registerElement = (id: string): Element => {
      const domElement = document.createElement('div');
      service.registerElementCode(id, `${id}_alias`, 'TEST', domElement, 1);
      return domElement;
    };

    beforeEach(() => {
      FakeIntersectionObserver.instances = [];
      vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      service = TestBed.inject(UnitStateService);
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('should set an element displayed when it comes into view', () => {
      registerElement('element_1');
      registerElement('element_2');
      const observer = FakeIntersectionObserver.live[0];

      observer.reportIntersection(observer.targets[0]);

      expect(service.getElementCodeById('element_1')?.status).toEqual('DISPLAYED');
      expect(service.getElementCodeById('element_2')?.status).toEqual('NOT_REACHED');
    });

    it('should stop observing an element that has come into view', () => {
      registerElement('element_1');
      const observer = FakeIntersectionObserver.live[0];

      observer.reportIntersection(observer.targets[0]);

      expect(observer.targets).toEqual([]);
    });

    it('should disconnect the observer of the previous unit on reset', () => {
      registerElement('element_1');
      const observerOfFirstUnit = FakeIntersectionObserver.live[0];

      service.reset();

      expect(observerOfFirstUnit.disconnected).toBe(true);
      expect(FakeIntersectionObserver.live.length).toBe(1);
    });

    it('should keep neither observers nor observed elements over repeated unit starts', () => {
      for (let unitStart = 0; unitStart < 20; unitStart += 1) {
        registerElement(`element_${unitStart}`);
        service.reset();
      }

      expect(FakeIntersectionObserver.live.length).toBe(1);
      expect(FakeIntersectionObserver.live[0].targets).toEqual([]);
    });
  });
});
