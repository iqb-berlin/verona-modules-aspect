import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslateModule } from '@ngx-translate/core';
import { EditorSharedModule } from 'editor/modules/editor-shared/editor-shared.module';
import { AudioImportDialogComponent } from './components/audio-import-dialog/audio-import-dialog.component';

/** The import of audio files: the dialog, and beside it the transcoding it runs in `utils/`. */
@NgModule({
  declarations: [
    AudioImportDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatDialogModule,
    MatIconModule,
    MatProgressBarModule,
    TranslateModule,
    EditorSharedModule
  ],
  exports: [
    AudioImportDialogComponent
  ]
})
export class AudioImportModule { }
