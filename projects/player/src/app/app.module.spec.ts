import { TestBed } from '@angular/core/testing';
import { ErrorHandler } from '@angular/core';
import { OVERLAY_DEFAULT_CONFIG } from '@angular/cdk/overlay';
import { ErrorService } from 'player/src/app/services/error.service';
import { AppModule } from './app.module';

/**
 * What this module hands over, asked of the module itself.
 */
describe('AppModule', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AppModule] }).compileComponents();
  });

  /* `overlay-placement.spec.ts` in common shows what the token does to CDK, but it provides the token
     itself - it would stay green if this module stopped handing it over. Only the e2e suite would
     notice that, and the e2e suite is not part of `npm test` (#986). */
  it('keeps the overlays out of the popover top layer', () => {
    expect(TestBed.inject(OVERLAY_DEFAULT_CONFIG)).toEqual({ usePopover: false });
  });

  /* One instance, not two: the service is `providedIn: 'root'`, so registering it as the ErrorHandler
     with `useClass` gave Angular an instance of its own. This one holds no state yet, which is what
     made the two indistinguishable -- the first field on it would end that quietly (#1206). */
  it('hands Angular the same error service that is injected elsewhere', () => {
    expect(TestBed.inject(ErrorHandler)).toBe(TestBed.inject(ErrorService));
  });
});
