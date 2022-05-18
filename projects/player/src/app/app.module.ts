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
import { PagesLayoutComponent } from './components/layouts/layout-pages/pages-layout.component';
import { PageLabelDirective } from './directives/page-label.directive';
import { ScrollToIndexDirective } from './directives/scroll-to-index.directive';
import { InViewDetectionDirective } from './directives/in-view-detection.directive';
import { FloatingMarkingBarComponent } from './components/floating-marking-bar/floating-marking-bar.component';
import { FloatingKeypadComponent } from './components/floating-keypad/floating-keypad.component';
import {
  ElementGroupSelectionComponent
} from './components/elements/element-group-selection/element-group-selection.component';
import { InputGroupElementComponent } from './components/elements/input-group-element/input-group-element.component';
import {
  MediaPlayerGroupElementComponent
} from './components/elements/media-player-group-element/media-player-group-element.component';
import {
  TextInputGroupElementComponent
} from './components/elements/text-input-group-element/text-input-group-element.component';
import {
  CompoundGroupElementComponent
} from './components/elements/compound-group-element/compound-group-element.component';
import { CastPipe } from './pipes/cast.pipe';
import { TextGroupElementComponent } from './components/elements/text-group-element/text-group-element.component';
import { BaseGroupElementComponent } from './components/elements/base-group-element/base-group-element.component';
import {
  InteractiveGroupElementComponent
} from './components/elements/interactive-group-element/interactive-group-element.component';
import { PlayerLayoutComponent } from './components/layouts/player-layout/player-layout.component';
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
    PagesLayoutComponent,
    PageLabelDirective,
    ScrollToIndexDirective,
    InViewDetectionDirective,
    FloatingMarkingBarComponent,
    FloatingKeypadComponent,
    ElementGroupSelectionComponent,
    InputGroupElementComponent,
    MediaPlayerGroupElementComponent,
    TextInputGroupElementComponent,
    CompoundGroupElementComponent,
    CastPipe,
    TextGroupElementComponent,
    BaseGroupElementComponent,
    InteractiveGroupElementComponent,
    PlayerLayoutComponent,
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
