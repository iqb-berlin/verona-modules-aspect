import { Component, Input, signal } from '@angular/core';
import { TextAreaElement } from 'common/models/elements/text-area';
import { TextInputComponent } from 'common/directives/text-input-component.directive';

@Component({
  selector: 'aspect-text-area',
  templateUrl: './text-area.component.html',
  styleUrls: ['./text-area.component.scss'],
  host: {
    '[class.table-word-count]': 'tableMode && elementModel.showWordCount'
  },
  standalone: false
})
export class TextAreaComponent extends TextInputComponent {
  @Input() elementModel!: TextAreaElement;
  dynamicRows: number = 0;
  @Input() tableMode: boolean = false;
  /**
   * What the word count strip shows. Counting is the player's job; the editor never sets this, so its
   * strip shows 0 words whatever the preset holds. A signal, because the player sets it once the view
   * has been checked.
   */
  wordCount = signal<number>(0);
}
