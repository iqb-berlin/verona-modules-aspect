import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  standalone: false,
  selector: 'aspect-editor-text2-wizard-dialog',
  templateUrl: './marking-panel-dialog.component.html',
  styleUrls: ['./marking-panel-dialog.component.scss']
})
export class MarkingPanelDialogComponent {
  text1: string = '';
  showHelper: boolean = true;
  markingMode: 'word' | 'range' = 'word';
  connectedText: string | undefined;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { availableTextIDs: string[] }) { }
}
