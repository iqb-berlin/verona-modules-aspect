import { NgModule } from '@angular/core';
import { NumberFieldDirective } from './number-field.directive';
import { NumberFieldBadInputDirective } from './number-field-bad-input.directive';

/**
 * A module of its own so the directive has one owner and can be pulled into a spec's own host
 * module without being declared twice. Precedent: player's page-label.module.ts.
 *
 * Re-exported by EditorSharedModule, which is how everything else gets it: the properties panel
 * uses it at 31 boxes and the player and hotspot dialogs at the remaining 11, so it belongs to
 * neither of them.
 */
@NgModule({
  declarations: [NumberFieldDirective, NumberFieldBadInputDirective],
  exports: [NumberFieldDirective, NumberFieldBadInputDirective]
})
export class NumberFieldModule {}
