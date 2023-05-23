// eslint-disable-next-line max-classes-per-file
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { TranslateModule } from '@ngx-translate/core';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacySliderModule as MatSliderModule } from '@angular/material/legacy-slider';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { HotspotImageComponent } from 'common/components/input-elements/hotspot-image.component';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { ScrollPagesPipe } from 'common/pipes/scroll-pages.pipe';
import { MathEditorModule } from 'common/math-editor.module';
import { DynamicRowsDirective } from 'common/directives/dynamic-rows.directive';
import { TextComponent } from './components/text/text.component';
import { ButtonComponent } from './components/button/button.component';
import { TextFieldComponent } from './components/input-elements/text-field.component';
import {
  TextFieldSimpleComponent
} from './components/compound-elements/cloze/cloze-child-elements/text-field-simple.component';
import { TextAreaComponent } from './components/input-elements/text-area.component';
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
import { LikertComponent } from './components/compound-elements/likert/likert.component';
import {
  LikertRadioButtonGroupComponent
} from './components/compound-elements/likert/likert-radio-button-group.component';
import { ImageMagnifierComponent } from './components/media-elements/image-magnifier.component';
import { RadioGroupImagesComponent } from './components/input-elements/radio-group-images.component';
import { DropListComponent } from './components/input-elements/drop-list.component';
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
import { CompoundChildOverlayComponent } from './components/compound-elements/cloze/compound-child-overlay.component';
import { MarkListPipe } from './pipes/mark-list.pipe';
import { IsDisabledDirective } from './directives/is-disabled.directive';
import { GeometryComponent } from './components/geometry/geometry.component';
import { MathAtanPipe } from './pipes/math-atan.pipe';
import { MathDegreesPipe } from './pipes/math-degrees.pipe';
import { ArrayIncludesPipe } from './pipes/array-includes.pipe';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { GetValuePipe, MathFieldComponent } from './components/input-elements/math-field.component';
import { MeasurePipe } from 'common/pipes/measure.pipe';

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
    MathEditorModule
  ],
  declarations: [
    ButtonComponent,
    TextComponent,
    TextFieldComponent,
    TextFieldSimpleComponent,
    TextAreaComponent,
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
    CompoundChildOverlayComponent,
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
    MeasurePipe
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
    FrameComponent,
    ImageComponent,
    GeometryComponent,
    MathFieldComponent,
    MeasurePipe
  ]
})
export class SharedModule {
  constructor(iconRegistry: MatIconRegistry, private sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon(
      'rubber-black',
      sanitizer.bypassSecurityTrustResourceUrl('assets/images/rubber-black.svg')
    );
  }
}

export abstract class APIService {
  abstract getResourceURL(): string;
}
