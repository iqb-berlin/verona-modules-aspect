import {
  Component, EventEmitter, Input, Output
} from '@angular/core';

@Component({
  standalone: false,
  selector: 'aspect-editor-wizard-audio',
  templateUrl: './audio-row.component.html',
  styleUrls: ['./audio-row.component.scss']
})
export class AudioRowComponent {
  @Input() src: string | undefined;
  @Input() maxRuns!: number;
  @Output() maxRunsChange = new EventEmitter<number>();
  @Output() changeMediaSrc = new EventEmitter();
}
