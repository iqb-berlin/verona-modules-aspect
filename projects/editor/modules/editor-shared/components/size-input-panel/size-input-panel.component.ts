import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { Measurement } from 'common/models/ui-element-interfaces';

@Component({
  selector: 'aspect-size-input-panel',
  standalone: false,
  templateUrl: './size-input-panel.component.html',
  styleUrls: ['./size-input-panel.component.scss']
})
export class SizeInputPanelComponent {
  @Input() label!: string;
  @Input() value!: number;
  @Input() unit!: string;
  @Input() allowedUnits!: string[];
  @Input() disabled!: boolean;
  @Output() valueUpdated = new EventEmitter<Measurement>();

  getCombinedString(): { value: number; unit: string } {
    this.value = this.value ? this.value : 0;
    return { value: this.value, unit: this.unit };
  }
}
