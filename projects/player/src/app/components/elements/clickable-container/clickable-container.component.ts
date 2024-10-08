import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { ClickableComponent } from 'player/src/app/components/elements/clickable/clickable.component';
import { Clickable } from 'player/src/app/models/clickable-text-node.interface';

@Component({
  selector: 'aspect-clickable-container',
  standalone: true,
  imports: [
    ClickableComponent
  ],
  templateUrl: './clickable-container.component.html',
  styleUrl: './clickable-container.component.scss'
})
export class ClickableContainerComponent {
  @Output() itemsChanged = new EventEmitter<number>();
  @Input() items!: Clickable[];

  onClick(id: number): void {
    console.log('ClickableContainerComponent clicked', id);
  }
}
