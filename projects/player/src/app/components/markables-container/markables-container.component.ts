import {
  Component, EventEmitter, Input
} from '@angular/core';
import { MarkableWordComponent } from 'player/src/app/components/markable-word/markable-word.component';
import { Markable } from 'player/src/app/models/markable.interface';
import { BehaviorSubject } from 'rxjs';
import { JsonPipe } from '@angular/common';

import { MarkingRange } from 'common/models/marking-data';

@Component({
  selector: 'aspect-markables-container',
  standalone: true,
  imports: [
    MarkableWordComponent,
    JsonPipe
  ],
  templateUrl: './markables-container.component.html',
  styleUrl: './markables-container.component.scss'
})
export class MarkablesContainerComponent {
  @Input() selectedColor!: BehaviorSubject<string | undefined>;
  @Input() markables!: Markable[];
  @Input() markingRange!: BehaviorSubject<MarkingRange | null> | null;
  @Input() markablesChange: EventEmitter<void> = new EventEmitter<void>();

  onColorChange() {
    this.markablesChange.emit();
  }
}
