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
import { TextComponent } from './components/ui-elements/text.component';
import { ButtonComponent } from './components/ui-elements/button.component';
import { TextFieldComponent } from './components/ui-elements/text-field.component';
import { TextAreaComponent } from './components/ui-elements/text-area.component';
import { CheckboxComponent } from './components/ui-elements/checkbox.component';
import { DropdownComponent } from './components/ui-elements/dropdown.component';
import { RadioButtonGroupComponent } from './components/ui-elements/radio-button-group.component';
import { ImageComponent } from './components/ui-elements/image.component';
import { VideoComponent } from './components/ui-elements/video.component';
import { AudioComponent } from './components/ui-elements/audio.component';
import { SafeResourceUrlPipe } from './pipes/safe-resource-url.pipe';
import { InputBackgroundColorDirective } from './directives/input-background-color.directive';
import { ErrorTransformPipe } from './pipes/error-transform.pipe';
import { SafeResourceHTMLPipe } from './pipes/safe-resource-html.pipe';
import { ControlBarComponent } from './components/control-bar/control-bar.component';
import { PlayerTimeFormatPipe } from './components/control-bar/player-time-format.pipe';
import { LikertComponent } from './components/ui-elements/likert.component';
import { LikertRadioButtonGroupComponent } from './components/ui-elements/likert-radio-button-group.component';
import { Magnifier } from './components/magnifier.component';
import { RadioGroupImagesComponent } from './components/ui-elements/radio-group-images.component';
import { DropListComponent } from './components/ui-elements/drop-list.component';
import { ClozeComponent } from './components/ui-elements/cloze.component';
import { TextFieldSimpleComponent } from './components/ui-elements/text-field-simple.component';
import { SliderComponent } from './components/ui-elements/slider.component';
import { SpellCorrectComponent } from './components/ui-elements/spell-correct.component';
import { DropListSimpleComponent } from './components/ui-elements/drop-list-simple.component';
import { FrameComponent } from './components/ui-elements/frame.component';
import { ToggleButtonComponent } from './components/ui-elements/toggle-button.component';
import { MarkingBarComponent } from './components/marking-bar/marking-bar.component';
import { StyleMarksPipe } from './pipes/styleMarks.pipe';
import { MarkingButtonComponent } from './components/marking-bar/marking-button.component';
import { CompoundChildOverlayComponent } from './components/compound-child-overlay.component';

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
    MarkingButtonComponent,
    CompoundChildOverlayComponent
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
