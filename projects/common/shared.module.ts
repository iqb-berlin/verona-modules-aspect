// eslint-disable-next-line max-classes-per-file
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { registerComponents } from 'common/utils/component-registration';

import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSliderModule } from '@angular/material/slider';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HotspotImageComponent } from 'common/components/input-group/hotspot-image/hotspot-image.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ScrollPagesPipe } from 'common/pipes/scroll-pages.pipe';
import { MathEditorModule } from 'common/math-editor/math-editor.module';
import { DynamicRowsDirective } from 'common/directives/dynamic-rows.directive';
import { TooltipEventTooltipDirective } from 'common/directives/tooltip-event-tooltip.directive';
import { TooltipComponent } from 'common/components/tooltip/tooltip.component';
import { PointerEventTooltipDirective } from 'common/directives/pointer-event-tooltip.directive';
import {
  ClozeChildErrorMessageComponent
} from 'common/components/compound-group/cloze-child-error-message/cloze-child-error-message.component';
import { TriggerComponent } from 'common/components/action-group/trigger/trigger.component';
import { ImageFullscreenDirective } from 'common/directives/image-fullscreen.directive';
import {
  TextMarkingButtonSvgComponent
} from 'common/components/text-group/text-marking-button-svg/text-marking-button-svg.component';
import { WidgetPeriodicTableComponent } from 'common/components/widget-group/widget-periodic-table/widget-periodic-table.component';
import {
  WidgetMoleculeEditorComponent
} from 'common/components/widget-group/widget-molecule-editor/widget-molecule-editor.component';
import { AreaSegmentComponent } from './components/text-input-group/area-segment/area-segment.component';
import { TextComponent } from './components/text-group/text/text.component';
import { ButtonComponent } from './components/action-group/button/button.component';
import { TextFieldComponent } from './components/text-input-group/text-field/text-field.component';
import {
  TextFieldSimpleComponent
} from './components/compound-group/text-field-simple/text-field-simple.component';
import { TextAreaComponent } from './components/text-input-group/text-area/text-area.component';
import { AutoHeightDirective } from './directives/auto-height.directive';
import { CheckboxComponent } from './components/input-group/checkbox/checkbox.component';
import { DropdownComponent } from './components/input-group/dropdown/dropdown.component';
import { RadioButtonGroupComponent } from './components/input-group/radio-button-group/radio-button-group.component';
import { ImageComponent } from './components/interactive-group/image/image.component';
import { VideoComponent } from './components/media-player-group/video/video.component';
import { AudioComponent } from './components/media-player-group/audio/audio.component';
import { SafeResourceUrlPipe } from './pipes/safe-resource-url.pipe';
import { InputBackgroundColorDirective } from './directives/input-background-color.directive';
import { ErrorTransformPipe } from './pipes/error-transform.pipe';
import { SafeResourceHTMLPipe } from './pipes/safe-resource-html.pipe';
import { MediaPlayerControlBarComponent }
  from './components/media-player-group/media-player-control-bar/media-player-control-bar.component';
import {
  MediaPlayerTimeFormatPipe
} from './pipes/media-player-time-format.pipe';
import { LikertComponent } from './components/compound-group/likert/likert.component';
import { LikertRowBackgroundColorPipe } from './pipes/likert-row-background-color.pipe';
import {
  LikertRadioButtonGroupComponent
} from './components/compound-group/likert-radio-button-group/likert-radio-button-group.component';
import { ImageMagnifierComponent } from './components/interactive-group/image-magnifier/image-magnifier.component';
import { RadioGroupImagesComponent } from './components/input-group/radio-group-images/radio-group-images.component';
import { DropListComponent } from './components/input-group/drop-list/drop-list.component';
import { ClozeComponent } from './components/compound-group/cloze/cloze.component';
import { SliderComponent } from './components/input-group/slider/slider.component';
import { SpellCorrectComponent } from './components/text-input-group/spell-correct/spell-correct.component';
import { FrameComponent } from './components/base-group/frame/frame.component';
import {
  ToggleButtonComponent
} from './components/compound-group/toggle-button/toggle-button.component';
import { TextMarkingBarComponent } from './components/text-group/text-marking-bar/text-marking-bar.component';
import { StyleMarksPipe } from './pipes/style-marks.pipe';
import { TextMarkingButtonComponent } from './components/text-group/text-marking-button/text-marking-button.component';
import {
  ClozeChildOverlayComponent
} from './components/compound-group/cloze-child-overlay/cloze-child-overlay.component';
import { MarkListPipe } from './pipes/mark-list.pipe';
import { IsDisabledDirective } from './directives/is-disabled.directive';
import { GeometryComponent } from './components/external-app-group/geometry/geometry.component';
import { MathAtanPipe } from './pipes/math-atan.pipe';
import { MathDegreesPipe } from './pipes/math-degrees.pipe';
import { ArrayIncludesPipe } from './pipes/array-includes.pipe';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { GetValuePipe } from './pipes/get-value.pipe';
import { AreaRowHeightPipe } from './pipes/area-row-height.pipe';
import { MathFieldComponent } from './components/text-input-group/math-field/math-field.component';
import { SplitPipe } from './pipes/split.pipe';
import { TextImagePanelComponent } from './components/text-image-panel/text-image-panel.component';
import { UnitDefErrorDialogComponent } from './components/unit-def-error-dialog/unit-def-error-dialog.component';
import { MathTableComponent } from './components/interactive-group/math-table/math-table.component';

import { TextAreaMathComponent } from './components/text-input-group/text-area-math/text-area-math.component';
import { DragImageComponent } from './components/input-group/drag-image/drag-image.component';
import { DraggableDirective } from './directives/draggable.directive';
import { ImageSrcPipe } from './pipes/image-src.pipe';
import { TableComponent } from './components/compound-group/table/table.component';
import { TableChildOverlay } from './components/compound-group/table-child-overlay/table-child-overlay.component';
import { MeasurePipe } from './pipes/measure.pipe';
import { TableGridRowsPipe } from './pipes/table-grid-rows.pipe';
import { MarkingPanelComponent } from './components/interactive-group/marking-panel/marking-panel.component';
import { HasTextContentPipe } from './pipes/has-text-content.pipe';

@NgModule({
  declarations: [
    ButtonComponent,
    TriggerComponent,
    TextComponent,
    TextFieldComponent,
    TextFieldSimpleComponent,
    TextAreaComponent,
    TextAreaMathComponent,
    ImageComponent,
    AudioComponent,
    VideoComponent,
    RadioButtonGroupComponent,
    CheckboxComponent,
    DropdownComponent,
    SafeResourceUrlPipe,
    InputBackgroundColorDirective,
    ErrorTransformPipe,
    SafeResourceHTMLPipe,
    ScrollPagesPipe,
    MediaPlayerControlBarComponent,
    MediaPlayerTimeFormatPipe,
    LikertComponent,
    LikertRadioButtonGroupComponent,
    ImageMagnifierComponent,
    RadioGroupImagesComponent,
    DropListComponent,
    ClozeComponent,
    HotspotImageComponent,
    SliderComponent,
    SpellCorrectComponent,
    FrameComponent,
    ToggleButtonComponent,
    TextMarkingBarComponent,
    StyleMarksPipe,
    TextMarkingButtonComponent,
    ClozeChildOverlayComponent,
    MarkListPipe,
    IsDisabledDirective,
    GeometryComponent,
    MathAtanPipe,
    MathDegreesPipe,
    ArrayIncludesPipe,
    SpinnerComponent,
    GetValuePipe,
    SplitPipe,
    MathFieldComponent,
    DynamicRowsDirective,
    TextImagePanelComponent,
    UnitDefErrorDialogComponent,
    TooltipComponent,
    TooltipEventTooltipDirective,
    PointerEventTooltipDirective,
    ClozeChildErrorMessageComponent,
    AutoHeightDirective,
    LikertRowBackgroundColorPipe,
    MathTableComponent,
    DragImageComponent,
    WidgetPeriodicTableComponent,
    WidgetMoleculeEditorComponent,
    ImageSrcPipe,
    TableComponent,
    TableChildOverlay,
    MarkingPanelComponent,
    MeasurePipe,
    TableGridRowsPipe,
    HasTextContentPipe
  ],
  exports: [
    CommonModule,
    MatIconModule,
    MatTabsModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDialogModule,
    TranslateModule,
    SafeResourceHTMLPipe,
    HasTextContentPipe,
    ScrollPagesPipe,
    TextMarkingBarComponent,
    ToggleButtonComponent,
    TextFieldComponent,
    TextFieldSimpleComponent,
    TextAreaComponent,
    AudioComponent,
    VideoComponent,
    TextComponent,
    CheckboxComponent,
    SpellCorrectComponent,
    SliderComponent,
    DropdownComponent,
    RadioButtonGroupComponent,
    RadioGroupImagesComponent,
    DropListComponent,
    ClozeComponent,
    HotspotImageComponent,
    LikertComponent,
    ButtonComponent,
    TriggerComponent,
    FrameComponent,
    ImageComponent,
    GeometryComponent,
    MathFieldComponent,
    TextImagePanelComponent,
    TextAreaMathComponent,
    MathTableComponent,
    WidgetPeriodicTableComponent,
    WidgetMoleculeEditorComponent,
    ImageSrcPipe,
    TableComponent,
    TableChildOverlay,
    MarkingPanelComponent,
    MeasurePipe,
    TableGridRowsPipe
  ],
  imports: [
    CommonModule,
    DragDropModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    FormsModule,
    MatTooltipModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatButtonModule,
    TranslateModule,
    MatSliderModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MathEditorModule,
    MatListModule,
    CdkConnectedOverlay,
    CdkOverlayOrigin,
    DraggableDirective,
    ImageFullscreenDirective,
    AreaSegmentComponent,
    AreaRowHeightPipe,
    TextMarkingButtonSvgComponent
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi())
  ]
})

export class SharedModule {
  constructor() {
    registerComponents();
  }
}

export { APIService } from './services/api.service';
