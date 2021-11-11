import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule } from '@angular/material/sidenav';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatRadioModule } from '@angular/material/radio';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { TranslateModule } from '@ngx-translate/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSliderModule } from '@angular/material/slider';
import { TextComponent } from './element-components/text.component';
import { ButtonComponent } from './element-components/button.component';
import { TextFieldComponent } from './element-components/text-field.component';
import { TextAreaComponent } from './element-components/text-area.component';
import { CheckboxComponent } from './element-components/checkbox.component';
import { DropdownComponent } from './element-components/dropdown.component';
import { RadioButtonGroupComponent } from './element-components/radio-button-group.component';
import { ImageComponent } from './element-components/image.component';
import { VideoComponent } from './element-components/video.component';
import { AudioComponent } from './element-components/audio.component';
import { SliderComponent } from './element-components/slider.component';
import { SafeResourceUrlPipe } from './element-components/pipes/safe-resource-url.pipe';
import { InputBackgroundColorDirective } from './element-components/directives/input-background-color.directive';
import { ErrorTransformPipe } from './element-components/pipes/error-transform.pipe';
import { SafeResourceHTMLPipe } from './element-components/pipes/safe-resource-html.pipe';
import { ControlBarComponent } from './element-components/control-bar/control-bar.component';
import { PlayerTimeFormatPipe } from './element-components/control-bar/player-time-format.pipe';
import { LikertComponent } from './element-components/compound-elements/likert.component';
import { LikertRadioButtonGroupComponent } from './element-components/compound-elements/likert-radio-button-group.component';
import { Magnifier } from './element-components/magnifier.component';
import { RadioGroupImagesComponent } from './element-components/compound-elements/radio-group-images.component';
import { DropListComponent } from './element-components/compound-elements/drop-list.component';
import { MAT_DATE_LOCALE } from '@angular/material/core';

@NgModule({
  imports: [
    CommonModule,
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
    MatSliderModule
  ],
  declarations: [
    ButtonComponent,
    TextComponent,
    TextFieldComponent,
    TextAreaComponent,
    ImageComponent,
    AudioComponent,
    VideoComponent,
    SliderComponent,
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
    DropListComponent
  ],
  exports: [
    CommonModule,
    FlexLayoutModule,
    MatToolbarModule,
    MatIconModule,
    MatTabsModule,
    MatButtonModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    MatCheckboxModule,
    MatSelectModule,
    MatRadioModule,
    MatListModule,
    MatExpansionModule,
    MatSidenavModule,
    MatFormFieldModule,
    ButtonComponent,
    TextComponent,
    TextFieldComponent,
    TextAreaComponent,
    ImageComponent,
    AudioComponent,
    VideoComponent,
    SliderComponent,
    RadioButtonGroupComponent,
    CheckboxComponent,
    DropdownComponent,
    MatSnackBarModule,
    MatTooltipModule,
    MatDialogModule,
    TranslateModule,
    SafeResourceHTMLPipe
  ],
  providers:
    [
      { provide: MAT_DATE_LOCALE, useValue: 'de-DE' }
    ]
})
export class SharedModule { }
