import { DoBootstrap, Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { createCustomElement } from '@angular/elements';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { AppComponent } from './app.component';
import { PageComponent } from './components/page/page.component';
import { SectionComponent } from './components/section/section.component';
import { SharedModule } from '../../../common/shared.module';
import { PlayerStateComponent } from './components/player-state/player-state.component';
import { PlayerTranslateLoader } from './classes/player-translate-loader';
import { LayoutPagesComponent } from './components/layout-pages/layout-pages.component';
import { HideFirstChildDirective } from './directives/hide-first-child.directive';
import { ScrollIndexDirective } from './directives/scroll-index.directive';
import { IntersectionDetectionDirective } from './directives/intersection-detection.directive';
import { KeypadComponent } from './components/keypad/keypad.component';
import { KeypadKeyComponent } from './components/keypad-key/keypad-key.component';
import { KeypadFrenchComponent } from './components/keypad-french/keypad-french.component';
import { KeypadMathComponent } from './components/keypad-math/keypad-math.component';
import { FloatingMarkingBarComponent } from './components/floating-marking-bar/floating-marking-bar.component';
import { FloatingKeypadComponent } from './components/floating-keypad/floating-keypad.component';
import { ElementSplitterComponent } from './components/element-splitter/element-splitter.component';
import { ElementInputGroupComponent } from './components/element-input-group/element-input-group.component';
import {
  ElementMediaPlayerGroupComponent
} from './components/element-media-player-group/element-media-player-group.component';
import {
  ElementTextInputGroupComponent
} from './components/element-text-input-group/element-text-input-group.component';
import { ElementCompoundGroupComponent } from './components/element-compound-group/element-compound-group.component';
import { CastPipe } from './pipes/cast.pipe';
import { ElementTextGroupComponent } from './components/element-text-group/element-text-group.component';
import { ElementBaseGroupComponent } from './components/element-base-group/element-base-group.component';
import {
  ElementInteractiveGroupComponent
} from './components/element-interactive-group/element-interactive-group.component';
import { UnitStateComponent } from './components/unit-state/unit-state.component';
import { LayoutPlayerComponent } from './components/layout-player/layout-player.component';
import { KeyboardComponent } from './components/keyboard/keyboard.component';

@NgModule({
  declarations: [
    AppComponent,
    PageComponent,
    SectionComponent,
    PlayerStateComponent,
    LayoutPagesComponent,
    HideFirstChildDirective,
    ScrollIndexDirective,
    IntersectionDetectionDirective,
    KeypadComponent,
    KeypadKeyComponent,
    KeypadFrenchComponent,
    KeypadMathComponent,
    FloatingMarkingBarComponent,
    FloatingKeypadComponent,
    ElementSplitterComponent,
    ElementInputGroupComponent,
    ElementMediaPlayerGroupComponent,
    ElementTextInputGroupComponent,
    ElementCompoundGroupComponent,
    CastPipe,
    ElementTextGroupComponent,
    ElementBaseGroupComponent,
    ElementInteractiveGroupComponent,
    UnitStateComponent,
    LayoutPlayerComponent,
    KeyboardComponent
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
    }),
    OverlayModule
  ],
  providers: []
})

export class AppModule implements DoBootstrap {
  constructor(private injector: Injector) {}
  ngDoBootstrap(): void {
    const playerElement = createCustomElement(AppComponent, { injector: this.injector });
    customElements.define('aspect-player', playerElement);
  }
}
