import { NgModule } from '@angular/core';
import { NumberFieldDirective } from './number-field.directive';

/**
 * A module of its own so the directive has one owner and can be pulled into a spec's own host
 * module without being declared twice. Precedent: player's page-label.module.ts.
 */
@NgModule({
  declarations: [NumberFieldDirective],
  exports: [NumberFieldDirective]
})
export class NumberFieldModule {}
