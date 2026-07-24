import { Component } from '@angular/core';
import { TextImageLabel } from 'common/models/label-interfaces';

@Component({
  standalone: false,
  selector: 'aspect-editor-likert-wizard-dialog',
  templateUrl: './likert-dialog.component.html',
  styleUrls: ['./likert-dialog.component.scss']
})
export class LikertWizardDialogComponent {
  text1: string = '';
  text2: string = '';
  options: TextImageLabel[] = [];
  rows: TextImageLabel[] = [];
}
