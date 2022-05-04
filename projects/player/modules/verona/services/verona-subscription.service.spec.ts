import { TestBed } from '@angular/core/testing';
import { VeronaSubscriptionService } from './verona-subscription.service';
import {
  VopContinueCommand, VopGetStateRequest, VopNavigationDeniedNotification, VopPageNavigationCommand, VopStartCommand,
  VopStopCommand
} from 'verona/models/verona';

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

  it('should get a VopGetStateRequest', done => {
    const StateRequestMessage: VopGetStateRequest = {
      type: 'vopGetStateRequest',
      sessionId: 'test',
      stop: true
    };
    service.vopGetStateRequest
      .subscribe(
        message => {
          expect(message).toEqual(StateRequestMessage);
          done();
        });
    window.postMessage(StateRequestMessage, '*');
  });

  it('should get a VopContinueCommand', done => {
    const continueCommandMessage: VopContinueCommand = {
      type: 'vopContinueCommand',
      sessionId: 'test'
    };
    service.vopContinueCommand
      .subscribe(
        message => {
          expect(message).toEqual(continueCommandMessage);
          done();
        });
    window.postMessage(continueCommandMessage, '*');
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

  it('should get a VopPageNavigationCommand', done => {
    const startCommandMessage: VopStopCommand = {
      type: 'vopStopCommand',
      sessionId: 'test'
    };
    service.vopStopCommand
      .subscribe(
        message => {
          expect(message).toEqual(startCommandMessage);
          done();
        });
    window.postMessage(startCommandMessage, '*');
  });
});
