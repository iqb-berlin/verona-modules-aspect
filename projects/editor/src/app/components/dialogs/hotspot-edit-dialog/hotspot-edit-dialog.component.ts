import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Hotspot } from 'common/models/elements/input-elements/hotspot-image';

@Component({
  selector: 'aspect-hotspot-edit-dialog',
  templateUrl: './hotspot-edit-dialog.component.html',
  styleUrls: ['./hotspot-edit-dialog.component.scss'],
  standalone: false
})
export class HotspotEditDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { hotspot: Hotspot }) { }

  newHotspot = { ...this.data.hotspot };
}
