import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { TranslateModule } from '@ngx-translate/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSliderModule } from '@angular/material/slider';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { TextComponent } from './ui-elements/text/text.component';
import { ButtonComponent } from './ui-elements/button/button.component';
import { TextFieldComponent } from './ui-elements/text-field/text-field.component';
import { TextFieldSimpleComponent } from './ui-elements/cloze/text-field-simple.component';
import { TextAreaComponent } from './ui-elements/text-area/text-area.component';
import { CheckboxComponent } from './ui-elements/checkbox/checkbox.component';
import { DropdownComponent } from './ui-elements/dropdown/dropdown.component';
import { RadioButtonGroupComponent } from './ui-elements/radio/radio-button-group.component';
import { ImageComponent } from './ui-elements/image/image.component';
import { VideoComponent } from './ui-elements/video/video.component';
import { AudioComponent } from './ui-elements/audio/audio.component';
import { SafeResourceUrlPipe } from './pipes/safe-resource-url.pipe';
import { InputBackgroundColorDirective } from './directives/input-background-color.directive';
import { ErrorTransformPipe } from './pipes/error-transform.pipe';
import { SafeResourceHTMLPipe } from './pipes/safe-resource-html.pipe';
import { MediaPlayerControlBarComponent }
  from './components/media-player-control-bar/media-player-control-bar.component';
import { MediaPlayerTimeFormatPipe } from './components/media-player-control-bar/media-player-time-format.pipe';
import { LikertComponent } from './ui-elements/likert/likert.component';
import { LikertRadioButtonGroupComponent } from './ui-elements/likert/likert-radio-button-group.component';
import { ImageMagnifierComponent } from './components/image-magnifier.component';
import { RadioGroupImagesComponent } from './ui-elements/radio-complex/radio-group-images.component';
import { DropListComponent } from './ui-elements/drop-list/drop-list.component';
import { ClozeComponent } from './ui-elements/cloze/cloze.component';
import { SliderComponent } from './ui-elements/slider/slider.component';
import { SpellCorrectComponent } from './ui-elements/spell-correct/spell-correct.component';
import { DropListSimpleComponent } from './ui-elements/cloze/drop-list-simple.component';
import { FrameComponent } from './ui-elements/frame/frame.component';
import { ToggleButtonComponent } from './ui-elements/cloze/toggle-button.component';
import { TextMarkingBarComponent } from './components/text-marking-bar/text-marking-bar.component';
import { StyleMarksPipe } from './pipes/styleMarks.pipe';
import { TextMarkingButtonComponent } from './components/text-marking-bar/text-marking-button.component';
import { CompoundChildOverlayComponent } from './components/compound-child-overlay.component';
import { MarkListPipe } from './pipes/mark-list.pipe';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    FlexLayoutModule,
    DragDropModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatButtonModule,
    TranslateModule,
    MatSliderModule,
    MatButtonToggleModule
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
    MediaPlayerControlBarComponent,
    MediaPlayerTimeFormatPipe,
    LikertComponent,
    LikertRadioButtonGroupComponent,
    ImageMagnifierComponent,
    RadioGroupImagesComponent,
    DropListComponent,
    ClozeComponent,
    DropListSimpleComponent,
    SliderComponent,
    SpellCorrectComponent,
    FrameComponent,
    ToggleButtonComponent,
    TextMarkingBarComponent,
    StyleMarksPipe,
    TextMarkingButtonComponent,
    CompoundChildOverlayComponent,
    MarkListPipe
  ],
  exports: [
    CommonModule,
    FlexLayoutModule,
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
    TextMarkingBarComponent,
    ToggleButtonComponent,
    TextFieldComponent,
    TextFieldSimpleComponent,
    DropListSimpleComponent,
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
    LikertComponent,
    ButtonComponent,
    FrameComponent,
    ImageComponent
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
