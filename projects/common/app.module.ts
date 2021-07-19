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

import { ButtonComponent } from './element-components/button.component';
import { CorrectionComponent } from './element-components/compound-components/correction.component';
import { RadioButtonGroupComponent } from './element-components/radio-button-group.component';
import { CheckboxComponent } from './element-components/checkbox.component';
import { TextFieldComponent } from './element-components/text-field.component';
import { ImageComponent } from './element-components/image.component';
import { VideoComponent } from './element-components/video.component';
import { AudioComponent } from './element-components/audio.component';
import { TextComponent } from './element-components/text.component';
import { DropdownComponent } from './element-components/dropdown.component';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    DragDropModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    FormsModule
  ],
  declarations: [
    ButtonComponent,
    TextComponent,
    TextFieldComponent,
    ImageComponent,
    AudioComponent,
    VideoComponent,
    RadioButtonGroupComponent,
    CheckboxComponent,
    DropdownComponent,
    CorrectionComponent
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
    ImageComponent,
    AudioComponent,
    VideoComponent,
    RadioButtonGroupComponent,
    CheckboxComponent,
    DropdownComponent,
    CorrectionComponent,
    MatSnackBarModule,
    MatTooltipModule
  ]
})
export class SharedModule { }
