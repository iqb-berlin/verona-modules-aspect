import { TestBed } from '@angular/core/testing';
import { fromEvent } from 'rxjs';
import {
  VopReadyNotification, VopStateChangedNotification, VopUnitNavigationRequestedNotification,
  VopWindowFocusChangedNotification
} from 'player/modules/verona/models/verona';
import { VeronaPostService } from './verona-post.service';

describe('VeronaPostService', () => {
  let service: VeronaPostService;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VeronaPostService);
    service.sessionID = 'test';
    service.stateReportPolicy = 'eager';
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should post a VopStateChangedNotification', done => {
    const expectedStateChangedNotification: VopStateChangedNotification = {
      type: 'vopStateChangedNotification',
      sessionId: 'test',
      timeStamp: Date.now()
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
    const metadata = {
      $schema: 'https://raw.githubusercontent.com/verona-interfaces/metadata/master/verona-module-metadata.json',
      name: [
        {
          lang: 'de',
          value: 'IQB-Player (Aspect)'
        }
      ],
      description: [
        {
          lang: 'de',
          value: 'Kann in Verbindung mit dem IQB-Editor (Aspect) im IQB-Studio oder im IQB-Testcenter genutzt werden.'
        }
      ],
      notSupportedFeatures: [],
      maintainer: {
        name: [
          {
            lang: 'de',
            value: 'IQB - Institut zur Qualitätsentwicklung im Bildungswesen'
          }
        ],
        url: 'https://www.iqb.hu-berlin.de',
        email: 'iqb-tbadev@hu-berlin.de'
      },
      code: {
        repositoryType: 'git',
        licenseType: 'MIT',
        licenseUrl: 'https://opensource.org/licenses/MIT',
        repositoryUrl: 'https://github.com/iqb-berlin/verona-modules-aspect'
      },
      type: 'player',
      id: 'iqb-player-aspect',
      version: 'version-placeholder',
      specVersion: '5.0',
      metadataVersion: '2.0'
    };
    const expectedReadyNotification: VopReadyNotification = {
      type: 'vopReadyNotification',
      metadata
    };
    const eventSubscription = fromEvent(window.parent, 'message')
      .subscribe(event => {
        expect((event as MessageEvent).data as VopReadyNotification)
          .toEqual(expectedReadyNotification);
        eventSubscription.unsubscribe();
        done();
      });
    VeronaPostService.sendReadyNotification(metadata);
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
      });
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
      });
    VeronaPostService.sendVopWindowFocusChangedNotification(true);
  });
});
