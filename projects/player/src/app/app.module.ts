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
import { LayoutPlayerComponent } from './components/layout-player/layout-player.component';
import { KeyInputModule } from '../../modules/key-input/key-input.module';
import { UnitStateDirective } from './directives/unit-state.directive';
import { KeyboardModule } from '../../modules/keyboard/keyboard.module';

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
    LayoutPlayerComponent,
    UnitStateDirective
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    SharedModule,
    KeyInputModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: PlayerTranslateLoader
      }
    }),
    OverlayModule,
    KeyboardModule
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
