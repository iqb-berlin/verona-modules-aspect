import { Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { createCustomElement } from '@angular/elements';

import { AppComponent } from './app.component';
import { PageComponent } from './page.component';
import { SectionComponent } from './section.component';
import { SubFormComponent } from './sub-form.component';

import { SharedModule } from '../../../common/app.module';

@NgModule({
  declarations: [
    AppComponent,
    PageComponent,
    SectionComponent,
    SubFormComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    SharedModule
  ],
  providers: [],
  // comment this and the selector in app.component in to make runnable standalone
  // bootstrap: [AppComponent]
  entryComponents: [
    AppComponent
  ]
})
export class AppModule {
  constructor(private injector: Injector) {}
  ngDoBootstrap(): void {
    const playerElement = createCustomElement(AppComponent, { injector: this.injector });
    customElements.define('player-aspect', playerElement);
  }
}
