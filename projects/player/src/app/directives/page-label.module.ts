import { NgModule } from '@angular/core';
import { PageLabelDirective } from './page-label.directive';

@NgModule({
  declarations: [PageLabelDirective],
  exports: [PageLabelDirective]
})
export class PageLabelModule {}
