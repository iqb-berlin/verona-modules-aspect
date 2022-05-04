import { TestBed } from '@angular/core/testing';
import { VeronaPostService } from './verona-post.service';
import { fromEvent } from 'rxjs';
import {
  VopReadyNotification, VopStateChangedNotification, VopUnitNavigationRequestedNotification,
  VopWindowFocusChangedNotification
} from 'verona/models/verona';

describe('VeronaPostService', () => {
  let service: VeronaPostService;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VeronaPostService);
    service.isStandalone = false;
    service.sessionId = 'test';
    service.stateReportPolicy = 'eager';
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should post a VopStateChangedNotification', () => {
    const expectedStateChangedNotification: VopStateChangedNotification = {
      type: 'vopStateChangedNotification',
      sessionId: 'test',
      timeStamp:  Date.now()
    };
    const eventSubscription = fromEvent(window.parent, 'message')
      .subscribe(event => {
        expect((event as MessageEvent).data as VopStateChangedNotification)
          .toEqual(expectedStateChangedNotification);
        eventSubscription.unsubscribe();
      });
    service.sendVopStateChangedNotification({});
  });

  it('should post a VopReadyNotification', () => {
    const expectedReadyNotification: VopReadyNotification = {
      type: 'vopReadyNotification',
      apiVersion: 'test'
    };
    const eventSubscription = fromEvent(window.parent, 'message')
      .subscribe(event => {
        expect((event as MessageEvent).data as VopReadyNotification)
          .toEqual(expectedReadyNotification);
        eventSubscription.unsubscribe();
      } );
    service.sendVopReadyNotification({ apiVersion: 'test' });
  });

  it('should post a VopUnitNavigationRequestedNotification', () => {
    const expectedUnitNavigationRequestedNotification: VopUnitNavigationRequestedNotification = {
      type: 'vopUnitNavigationRequestedNotification',
      sessionId: 'test',
      target: 'next'
    };
    const eventSubscription = fromEvent(window.parent, 'message')
      .subscribe(event => {
        expect((event as MessageEvent).data as VopUnitNavigationRequestedNotification)
          .toEqual(expectedUnitNavigationRequestedNotification);
        eventSubscription.unsubscribe();
      } );
    service.sendVopUnitNavigationRequestedNotification('next');
  });


  it('should post a VopUnitNavigationRequestedNotification', () => {
    const expectedWindowFocusChangedNotification: VopWindowFocusChangedNotification = {
      type: 'vopWindowFocusChangedNotification',
      timeStamp: Date.now(),
      hasFocus: true
    };
    const eventSubscription = fromEvent(window.parent, 'message')
      .subscribe(event => {
        expect((event as MessageEvent).data as VopWindowFocusChangedNotification)
          .toEqual(expectedWindowFocusChangedNotification);
        eventSubscription.unsubscribe();
      } );
    service.sendVopWindowFocusChangedNotification(true);
  });
});
