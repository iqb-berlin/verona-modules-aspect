import { TestBed } from '@angular/core/testing';
import {
  VopNavigationDeniedNotification, VopPageNavigationCommand, VopStartCommand
} from 'player/modules/verona/models/verona';
import { VeronaSubscriptionService } from './verona-subscription.service';

describe('VeronaSubscriptionService', () => {
  let service: VeronaSubscriptionService;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VeronaSubscriptionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get a vopStartCommand', done => {
    const startMessage: VopStartCommand = {
      type: 'vopStartCommand',
      sessionId: 'test',
      unitDefinition: 'TEST',
      playerConfig: {
        pagingMode: 'separate'
      }
    };
    service.vopStartCommand
      .subscribe(
        message => {
          expect(message).toEqual(startMessage);
          done();
        });
    window.postMessage(startMessage, '*');
  });

  it('should get a VopNavigationDeniedNotification', done => {
    const navigationDeniedNotificationMessage: VopNavigationDeniedNotification = {
      type: 'vopNavigationDeniedNotification',
      sessionId: 'test',
      reason: ['presentationIncomplete', 'responsesIncomplete']
    };
    service.vopNavigationDeniedNotification
      .subscribe(
        message => {
          expect(message).toEqual(navigationDeniedNotificationMessage);
          done();
        });
    window.postMessage(navigationDeniedNotificationMessage, '*');
  });

  it('should get a VopPageNavigationCommand', done => {
    const pageNavigationCommandMessage: VopPageNavigationCommand = {
      type: 'vopPageNavigationCommand',
      sessionId: 'test',
      target: 'next'
    };
    service.vopPageNavigationCommand
      .subscribe(
        message => {
          expect(message).toEqual(pageNavigationCommandMessage);
          done();
        });
    window.postMessage(pageNavigationCommandMessage, '*');
  });
});
