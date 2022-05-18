import { DoBootstrap, Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { createCustomElement } from '@angular/elements';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { AppComponent } from './app.component';
import { PageComponent } from './components/page/page.component';
import { SectionContainerComponent } from './components/sections/section-container/section-container.component';
import { SectionComponent } from './components/sections/section/section.component';
import { SharedModule } from 'common/shared.module';
import { PlayerTranslateLoader } from './classes/player-translate-loader';
import { LayoutPagesComponent } from './components/layouts/layout-pages/layout-pages.component';
import { PageLabelDirective } from './directives/page-label.directive';
import { ScrollToIndexDirective } from './directives/scroll-to-index.directive';
import { IntersectionDetectionDirective } from './directives/intersection-detection.directive';
import { FloatingMarkingBarComponent } from './components/floating-marking-bar/floating-marking-bar.component';
import { FloatingKeypadComponent } from './components/floating-keypad/floating-keypad.component';
import {
  ElementGroupSelectionComponent
} from './components/elements/element-group-selection/element-group-selection.component';
import { ElementInputGroupComponent } from './components/elements/element-input-group/element-input-group.component';
import {
  ElementMediaPlayerGroupComponent
} from './components/elements/element-media-player-group/element-media-player-group.component';
import {
  ElementTextInputGroupComponent
} from './components/elements/element-text-input-group/element-text-input-group.component';
import {
  ElementCompoundGroupComponent
} from './components/elements/element-compound-group/element-compound-group.component';
import { CastPipe } from './pipes/cast.pipe';
import { ElementTextGroupComponent } from './components/elements/element-text-group/element-text-group.component';
import { ElementBaseGroupComponent } from './components/elements/element-base-group/element-base-group.component';
import {
  ElementInteractiveGroupComponent
} from './components/elements/element-interactive-group/element-interactive-group.component';
import { LayoutPlayerComponent } from './components/layouts/layout-player/layout-player.component';
import { KeyInputModule } from 'player/modules/key-input/key-input.module';
import { UnitStateDirective } from './directives/unit-state.directive';
import { UnitMenuModule } from 'player/modules/unit-menu/unit-menu.module';
import { ValidPagesPipe } from './pipes/valid-pages.pipe';
import { ScrollPagesPipe } from './pipes/scroll-pages.pipe';
import { AlwaysVisiblePagePipe } from './pipes/always-visible-page.pipe';
import { PageIndexPipe } from './pipes/page-index.pipe';
import { PlayerStateDirective } from './directives/player-state.directive';

@NgModule({
  declarations: [
    AppComponent,
    PageComponent,
    SectionContainerComponent,
    SectionComponent,
    LayoutPagesComponent,
    PageLabelDirective,
    ScrollToIndexDirective,
    IntersectionDetectionDirective,
    FloatingMarkingBarComponent,
    FloatingKeypadComponent,
    ElementGroupSelectionComponent,
    ElementInputGroupComponent,
    ElementMediaPlayerGroupComponent,
    ElementTextInputGroupComponent,
    ElementCompoundGroupComponent,
    CastPipe,
    ElementTextGroupComponent,
    ElementBaseGroupComponent,
    ElementInteractiveGroupComponent,
    LayoutPlayerComponent,
    UnitStateDirective,
    ValidPagesPipe,
    AlwaysVisiblePagePipe,
    ScrollPagesPipe,
    PageIndexPipe,
    PlayerStateDirective
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
    UnitMenuModule
  ]
})

export class AppModule implements DoBootstrap {
  constructor(private injector: Injector) {}
  ngDoBootstrap(): void {
    const playerElement = createCustomElement(AppComponent, { injector: this.injector });
    customElements.define('aspect-player', playerElement);
  }
}
