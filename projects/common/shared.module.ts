// eslint-disable-next-line max-classes-per-file
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

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
import { HttpClientModule } from '@angular/common/http';
import { HotspotImageComponent } from 'common/components/input-elements/hotspot-image.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ScrollPagesPipe } from 'common/pipes/scroll-pages.pipe';
import { MathEditorModule } from 'common/math-editor.module';
import { DynamicRowsDirective } from 'common/directives/dynamic-rows.directive';
import { TooltipEventTooltipDirective } from 'common/components/tooltip/tooltip-event-tooltip.directive';
import { TooltipComponent } from 'common/components/tooltip/tooltip.component';
import { PointerEventTooltipDirective } from 'common/components/tooltip/pointer-event-tooltip.directive';
import { ClozeChildErrorMessage } from 'common/components/compound-elements/cloze/cloze-child-error-message';
import { TriggerComponent } from 'common/components/trigger/trigger.component';
import { TextComponent } from './components/text/text.component';
import { ButtonComponent } from './components/button/button.component';
import { TextFieldComponent } from './components/input-elements/text-field.component';
import {
  TextFieldSimpleComponent
} from './components/compound-elements/cloze/cloze-child-elements/text-field-simple.component';
import { AutoHeightDirective, TextAreaComponent } from './components/input-elements/text-area.component';
import { CheckboxComponent } from './components/input-elements/checkbox.component';
import { DropdownComponent } from './components/input-elements/dropdown.component';
import { RadioButtonGroupComponent } from './components/input-elements/radio-button-group.component';
import { ImageComponent } from './components/media-elements/image.component';
import { VideoComponent } from './components/media-elements/video.component';
import { AudioComponent } from './components/media-elements/audio.component';
import { SafeResourceUrlPipe } from './pipes/safe-resource-url.pipe';
import { InputBackgroundColorDirective } from './directives/input-background-color.directive';
import { ErrorTransformPipe } from './pipes/error-transform.pipe';
import { SafeResourceHTMLPipe } from './pipes/safe-resource-html.pipe';
import { MediaPlayerControlBarComponent }
  from './components/media-elements/media-player-control-bar/media-player-control-bar.component';
import {
  MediaPlayerTimeFormatPipe
} from './components/media-elements/media-player-control-bar/media-player-time-format.pipe';
import { LikertComponent, LikertRowBackgroundColorPipe } from './components/compound-elements/likert/likert.component';
import {
  LikertRadioButtonGroupComponent
} from './components/compound-elements/likert/likert-radio-button-group.component';
import { ImageMagnifierComponent } from './components/media-elements/image-magnifier.component';
import { RadioGroupImagesComponent } from './components/input-elements/radio-group-images.component';
import { DropListComponent } from './components/input-elements/drop-list/drop-list.component';
import { ClozeComponent } from './components/compound-elements/cloze/cloze.component';
import { SliderComponent } from './components/input-elements/slider.component';
import { SpellCorrectComponent } from './components/input-elements/spell-correct.component';
import { FrameComponent } from './components/frame/frame.component';
import {
  ToggleButtonComponent
} from './components/compound-elements/cloze/cloze-child-elements/toggle-button.component';
import { TextMarkingBarComponent } from './components/text/text-marking-bar/text-marking-bar.component';
import { StyleMarksPipe } from './pipes/styleMarks.pipe';
import { TextMarkingButtonComponent } from './components/text/text-marking-bar/text-marking-button.component';
import { ClozeChildOverlay } from './components/compound-elements/cloze/cloze-child-overlay.component';
import { MarkListPipe } from './pipes/mark-list.pipe';
import { IsDisabledDirective } from './directives/is-disabled.directive';
import { GeometryComponent } from './components/geometry/geometry.component';
import { MathAtanPipe } from './pipes/math-atan.pipe';
import { MathDegreesPipe } from './pipes/math-degrees.pipe';
import { ArrayIncludesPipe } from './pipes/array-includes.pipe';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { GetValuePipe, MathFieldComponent } from './components/input-elements/math-field.component';
import { MeasurePipe } from './pipes/measure.pipe';
import { TextImagePanelComponent } from './components/text-image-panel.component';
import { UnitDefErrorDialogComponent } from './components/unit-def-error-dialog.component';
import { MathTableComponent } from './components/input-elements/math-table.component';

import { TextAreaMathComponent } from './components/input-elements/text-area-math.component';
import { DragImageComponent } from './components/input-elements/drop-list/drag-image.component';
import { DraggableDirective } from './components/input-elements/drop-list/draggable.directive';
import { ImageFullscreenDirective } from 'common/directives/image-fullscreen.directive';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
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
    MathEditorModule,
    MatListModule,
    CdkConnectedOverlay,
    CdkOverlayOrigin,
    DraggableDirective,
    ImageFullscreenDirective
  ],
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
    ClozeChildOverlay,
    MarkListPipe,
    IsDisabledDirective,
    GeometryComponent,
    MathAtanPipe,
    MathDegreesPipe,
    ArrayIncludesPipe,
    SpinnerComponent,
    GetValuePipe,
    MathFieldComponent,
    DynamicRowsDirective,
    TextImagePanelComponent,
    UnitDefErrorDialogComponent,
    TooltipComponent,
    TooltipEventTooltipDirective,
    PointerEventTooltipDirective,
    ClozeChildErrorMessage,
    AutoHeightDirective,
    LikertRowBackgroundColorPipe,
    MathTableComponent,
    DragImageComponent
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
    MathTableComponent
  ]
})
export class SharedModule {}

export abstract class APIService {
  abstract getResourceURL(): string;
}
