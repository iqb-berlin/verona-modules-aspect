import { TestBed } from '@angular/core/testing';
import { VeronaPostService } from './verona-post.service';
import { fromEvent } from 'rxjs';
import {
  VopReadyNotification, VopStateChangedNotification, VopUnitNavigationRequestedNotification,
  VopWindowFocusChangedNotification
} from 'player/modules/verona/models/verona';

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

  it('should post a VopStateChangedNotification', done => {
    const expectedStateChangedNotification: VopStateChangedNotification = {
      type: 'vopStateChangedNotification',
      sessionId: 'test',
      timeStamp:  Date.now()
    };
    const eventSubscription = fromEvent(window.parent, 'message')
      .subscribe(event => {
        const data = ((event as MessageEvent).data as VopStateChangedNotification);
        expect(data.type).toEqual(expectedStateChangedNotification.type);
        expect(data.sessionId).toEqual(expectedStateChangedNotification.sessionId);
        expect(Object.prototype.hasOwnProperty.call(data, 'timeStamp')).toBeTruthy();
        eventSubscription.unsubscribe();
        done();
      });
    service.sendVopStateChangedNotification({});
  });

  it('should post a VopReadyNotification', done => {
    const expectedReadyNotification: VopReadyNotification = {
      type: 'vopReadyNotification',
      apiVersion: 'test'
    };
    const eventSubscription = fromEvent(window.parent, 'message')
      .subscribe(event => {
        expect((event as MessageEvent).data as VopReadyNotification)
          .toEqual(expectedReadyNotification);
        eventSubscription.unsubscribe();
        done();
      } );
    service.sendVopReadyNotification({ apiVersion: 'test' });
  });

  it('should post a VopUnitNavigationRequestedNotification', done => {
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
        done();
      } );
    service.sendVopUnitNavigationRequestedNotification('next');
  });


  it('should post a VopUnitNavigationRequestedNotification', done => {
    const expectedWindowFocusChangedNotification: VopWindowFocusChangedNotification = {
      type: 'vopWindowFocusChangedNotification',
      timeStamp: Date.now(),
      hasFocus: true
    };
    const eventSubscription = fromEvent(window.parent, 'message')
      .subscribe(event => {
        const data = ((event as MessageEvent).data as VopWindowFocusChangedNotification);
        expect(data.type).toEqual(expectedWindowFocusChangedNotification.type);
        expect(data.hasFocus).toEqual(expectedWindowFocusChangedNotification.hasFocus);
        expect(Object.prototype.hasOwnProperty.call(data, 'timeStamp')).toBeTruthy();
        eventSubscription.unsubscribe();
        done();
      } );
    service.sendVopWindowFocusChangedNotification(true);
  });
});
