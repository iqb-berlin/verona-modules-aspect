import {
  DoBootstrap, ErrorHandler, Injector, NgModule
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { createCustomElement } from '@angular/elements';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { SharedModule, APIService } from 'common/shared.module';
import { KeyInputModule } from 'player/modules/key-input/key-input.module';
import { UnitMenuModule } from 'player/modules/unit-menu/unit-menu.module';
import { MetaDataService } from 'player/src/app/services/meta-data.service';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { AsOverlayOriginPipe } from 'player/src/app/pipes/as-overlay-origin.pipe';
import { HasReturnKeyPipe } from 'player/src/app/pipes/has-return-key.pipe';
import { PageNavButtonComponent } from 'player/src/app/components/page-nav-button/page-nav-button.component';
import { HasPreviousPagePipe } from 'player/src/app/pipes/has-previous-page.pipe';
import { MeasurePipe } from 'common/pipes/measure.pipe';
import { TableComponent } from 'common/components/compound-elements/table/table.component';
import {
  MarkablesContainerComponent
} from 'player/src/app/components/markables-container/markables-container.component';
import { IsEnabledNavigationTargetPipe } from 'common/pipes/is-enabled-navigation-target.pipe';
import { MarkingPanelComponent } from 'common/components/text/marking-panel.component';
import { ErrorService } from 'player/src/app/services/error.service';
import { UnitNavNextComponent } from 'common/components/unit-nav-next.component';
import { AppComponent } from './app.component';
import { PageComponent } from './components/page/page.component';
import { SectionComponent } from './components/section/section.component';
import { PlayerTranslateLoader } from './classes/player-translate-loader';
import { PagesLayoutComponent } from './components/layouts/pages-layout/pages-layout.component';
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
import { UnitStateDirective } from './directives/unit-state.directive';
import { AlwaysVisiblePagePipe } from './pipes/always-visible-page.pipe';
import { PageIndexPipe } from './pipes/page-index.pipe';
import { PlayerStateDirective } from './directives/player-state.directive';
import { SectionVisibilityHandlingDirective } from './directives/section-visibility-handling.directive';
import { UnitComponent } from './components/unit/unit.component';
import { PageScrollButtonComponent } from './components/page-scroll-button/page-scroll-button.component';
import { ExternalAppGroupElementComponent } from
  './components/elements/external-app-group-element/external-app-group-element.component';
import { InputAssistanceCustomKeysPipe } from './pipes/input-assistance-custom-keys.pipe';
import { HasNextPagePipe } from './pipes/has-next-page.pipe';
import { IsValidPagePipe } from './pipes/is-valid-page.pipe';
import {
  MathKeyboardContainerComponent
} from 'player/src/app/components/math-keyboard-container/math-keyboard-container.component';

@NgModule({
  declarations: [
    AppComponent,
    PageComponent,
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
    AsOverlayOriginPipe,
    HasReturnKeyPipe,
    TextGroupElementComponent,
    BaseGroupElementComponent,
    InteractiveGroupElementComponent,
    PlayerLayoutComponent,
    UnitStateDirective,
    AlwaysVisiblePagePipe,
    PageIndexPipe,
    PlayerStateDirective,
    SectionVisibilityHandlingDirective,
    UnitComponent,
    PageScrollButtonComponent,
    ExternalAppGroupElementComponent,
    InputAssistanceCustomKeysPipe,
    PageNavButtonComponent,
    HasPreviousPagePipe,
    HasNextPagePipe,
    IsValidPagePipe
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
    ScrollingModule,
    UnitMenuModule,
    MeasurePipe,
    TableComponent,
    MarkablesContainerComponent,
    IsEnabledNavigationTargetPipe,
    MarkingPanelComponent,
    UnitNavNextComponent,
    MathKeyboardContainerComponent
  ],
  providers: [
    { provide: APIService, useExisting: MetaDataService },
    { provide: ErrorHandler, useClass: ErrorService }
  ]
})

export class AppModule implements DoBootstrap {
  constructor(private injector: Injector) {}
  ngDoBootstrap(): void {
    const playerElement = createCustomElement(AppComponent, { injector: this.injector });
    customElements.define('aspect-player', playerElement);
  }
}
