import { DoBootstrap, Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { createCustomElement } from '@angular/elements';

import { AppComponent } from './app.component';
import { PageComponent } from './page.component';
import { SectionComponent } from './section.component';
import { SharedModule } from '../../../common/app.module';
import { ElementOverlayComponent } from './element-overlay.component';

@NgModule({
  declarations: [
    AppComponent,
    PageComponent,
    SectionComponent,
    ElementOverlayComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    SharedModule
  ],
  providers: []
})

export class AppModule implements DoBootstrap {
  constructor(private injector: Injector) {}
  ngDoBootstrap(): void {
    const playerElement = createCustomElement(AppComponent, { injector: this.injector });
    customElements.define('player-aspect', playerElement);
  }
}
