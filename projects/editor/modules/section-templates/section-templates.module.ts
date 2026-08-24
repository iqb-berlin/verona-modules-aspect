import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'common/shared.module';
import { EditorSharedModule } from 'editor/modules/editor-shared/editor-shared.module';
import { RichTextEditorModule } from 'editor/modules/rich-text-editor/rich-text-editor.module';
import { CheckboxWizardDialogComponent } from './components/checkbox-dialog/checkbox-dialog.component';
import { DroplistWizardDialogComponent } from './components/droplist-dialog/droplist-dialog.component';
import { GeometryWizardDialogComponent } from './components/geometry-dialog/geometry-dialog.component';
import { LikertWizardDialogComponent } from './components/likert-dialog/likert-dialog.component';
import { MarkingPanelDialogComponent } from './components/marking-panel-dialog/marking-panel-dialog.component';
import { MathTableWizardDialogComponent } from './components/mathtable-dialog/mathtable-dialog.component';
import { ImageRadioComponent } from './components/radio/image-radio/image-radio.component';
import { RadioWizardDialogComponent } from './components/radio/radio-dialog/radio-dialog.component';
import { TextRadioComponent } from './components/radio/text-radio/text-radio.component';
import { Audio1StimulusComponent } from './components/stimulus/audio1-stimulus/audio1-stimulus.component';
import { Audio2StimulusComponent } from './components/stimulus/audio2-stimulus/audio2-stimulus.component';
import { AudioRowComponent } from './components/stimulus/audio-row/audio-row.component';
import { ChatStimulusComponent } from './components/stimulus/chat-stimulus/chat-stimulus.component';
import { EmailStimulusComponent } from './components/stimulus/email-stimulus/email-stimulus.component';
import { MessageStimulusComponent } from './components/stimulus/message-stimulus/message-stimulus.component';
import { StimulusWizardDialogComponent } from './components/stimulus/stimulus-dialog/stimulus-dialog.component';
import { TextStimulusComponent } from './components/stimulus/text-stimulus/text-stimulus.component';
import { Text3WizardDialogComponent } from './components/text3-dialog/text3-dialog.component';
import { InputWizardDialogComponent } from './components/text-input-dialog/text-input-dialog.component';

@NgModule({
  declarations: [
    CheckboxWizardDialogComponent,
    DroplistWizardDialogComponent,
    GeometryWizardDialogComponent,
    LikertWizardDialogComponent,
    MarkingPanelDialogComponent,
    MathTableWizardDialogComponent,
    ImageRadioComponent,
    RadioWizardDialogComponent,
    TextRadioComponent,
    Audio1StimulusComponent,
    Audio2StimulusComponent,
    AudioRowComponent,
    ChatStimulusComponent,
    EmailStimulusComponent,
    MessageStimulusComponent,
    StimulusWizardDialogComponent,
    TextStimulusComponent,
    Text3WizardDialogComponent,
    InputWizardDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    TextFieldModule,
    MatButtonModule,
    MatCheckboxModule,
    MatOptionModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatRadioModule,
    MatSelectModule,
    MatToolbarModule,
    MatTooltipModule,
    TranslateModule,
    SharedModule,
    EditorSharedModule,
    RichTextEditorModule
  ]
})
export class SectionTemplatesModule { }
