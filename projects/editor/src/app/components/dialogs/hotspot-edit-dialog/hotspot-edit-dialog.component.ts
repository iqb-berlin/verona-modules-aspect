import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Hotspot } from 'common/models/elements/input-group-elements/hotspot-image';

@Component({
  selector: 'aspect-hotspot-edit-dialog',
  templateUrl: './hotspot-edit-dialog.component.html',
  styleUrls: ['./hotspot-edit-dialog.component.scss'],
  standalone: false
})
export class HotspotEditDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { hotspot: Hotspot }) { }

  newHotspot = { ...this.data.hotspot };

  /**
   * What `aspectNumberField` worked out for one of the six number boxes.
   *
   * Unlike the properties panel this dialog edits a draft that only reaches the model when it is
   * confirmed, so assigning into `newHotspot` is sound here - what was missing is that `min="0"`
   * on every box meant nothing, and a negative size or rotation could be confirmed (#1161). A
   * refused entry is dropped; the directive has already put the box back to the draft value, which
   * is why the binding had to become one-way.
   */
  commitNumber(property: 'top' | 'left' | 'width' | 'height' | 'borderWidth' | 'rotation',
               update: { value: number | null; isInputValid: boolean }): void {
    if (update.isInputValid) this.newHotspot[property] = update.value ?? 0;
  }
}
