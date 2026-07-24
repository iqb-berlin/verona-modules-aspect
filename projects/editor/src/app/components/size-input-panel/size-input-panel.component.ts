import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf } from '@angular/common';
import { Measurement } from 'common/models/ui-element-interfaces';

@Component({
  selector: 'aspect-size-input-panel',
  imports: [
    NgIf,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatSelectModule,
    TranslateModule
  ],
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
