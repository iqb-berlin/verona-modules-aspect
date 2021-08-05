import { DoBootstrap, Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { createCustomElement } from '@angular/elements';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { AppComponent } from './app.component';
import { PageComponent } from './components/page.component';
import { SectionComponent } from './components/section/section.component';
import { SharedModule } from '../../../common/app.module';
import { ElementOverlayComponent } from './components/element-overlay.component';
import { ValidationMessageComponent } from './components/validation-message.component';
import { FormComponent } from './components/form.component';
import { PlayerStateComponent } from './components/player-state/player-state.component';
import { PlayerTranslateLoader } from './classes/player-translate-loader';

@NgModule({
  declarations: [
    AppComponent,
    PageComponent,
    SectionComponent,
    ElementOverlayComponent,
    ValidationMessageComponent,
    FormComponent,
    PlayerStateComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    SharedModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: PlayerTranslateLoader
      }
    })
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
