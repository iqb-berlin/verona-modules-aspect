import { TestBed } from '@angular/core/testing';
import { OVERLAY_DEFAULT_CONFIG } from '@angular/cdk/overlay';
import { AppModule } from './app.module';

/**
 * `overlay-placement.spec.ts` in common shows what the token does to CDK, but it provides the
 * token itself - it would stay green if this module stopped handing it over. Only the e2e suite
 * would notice that, and the e2e suite is not part of `npm test` (#986).
 */
describe('AppModule', () => {
  it('keeps the overlays out of the popover top layer', async () => {
    await TestBed.configureTestingModule({ imports: [AppModule] }).compileComponents();

    expect(TestBed.inject(OVERLAY_DEFAULT_CONFIG)).toEqual({ usePopover: false });
  });
});
