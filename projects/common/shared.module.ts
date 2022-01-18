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
import { ControlBarComponent } from './components/control-bar/control-bar.component';
import { PlayerTimeFormatPipe } from './components/control-bar/player-time-format.pipe';
import { LikertComponent } from './ui-elements/likert/likert.component';
import { LikertRadioButtonGroupComponent } from './ui-elements/likert/likert-radio-button-group.component';
import { Magnifier } from './ui-elements/image/magnifier.component';
import { RadioGroupImagesComponent } from './ui-elements/radio-with-images/radio-group-images.component';
import { DropListComponent } from './ui-elements/drop-list/drop-list.component';
import { ClozeComponent } from './ui-elements/cloze/cloze.component';
import { TextFieldSimpleComponent } from './ui-elements/textfield-simple/text-field-simple.component';
import { SliderComponent } from './ui-elements/slider/slider.component';
import { SpellCorrectComponent } from './ui-elements/spell-correct/spell-correct.component';
import { DropListSimpleComponent } from './ui-elements/drop-list-simple/drop-list-simple.component';
import { FrameComponent } from './ui-elements/frame/frame.component';
import { ToggleButtonComponent } from './ui-elements/toggle-button/toggle-button.component';
import { MarkingBarComponent } from './components/marking-bar/marking-bar.component';
import { StyleMarksPipe } from './ui-elements/cloze/styleMarks.pipe';
import { MarkingButtonComponent } from './components/marking-bar/marking-button.component';

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
    ControlBarComponent,
    PlayerTimeFormatPipe,
    LikertComponent,
    LikertRadioButtonGroupComponent,
    Magnifier,
    RadioGroupImagesComponent,
    DropListComponent,
    ClozeComponent,
    TextFieldSimpleComponent,
    DropListSimpleComponent,
    SliderComponent,
    SpellCorrectComponent,
    TextFieldSimpleComponent,
    FrameComponent,
    ToggleButtonComponent,
    MarkingBarComponent,
    StyleMarksPipe,
    MarkingButtonComponent
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
    MarkingBarComponent,
    ToggleButtonComponent,
    TextFieldComponent,
    DropListSimpleComponent,
    TextFieldSimpleComponent
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
