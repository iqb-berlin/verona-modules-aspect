import {
  ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewChild
} from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { UIElement } from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';

@Component({
  selector: 'aspect-table-child-overlay',
  standalone: false,
  templateUrl: './table-child-overlay.component.html',
  styleUrls: ['./table-child-overlay.component.scss']
})
export class TableChildOverlay {
  @Input() element!: UIElement;
  @Input() parentForm!: UntypedFormGroup;
  @Input() savedTexts!: { [key: string]: string };
  @Input() savedPlaybackTimes!: { [key: string]: number };
  @Input() actualPlayingId!: Subject<string | null>;
  @Input() mediaStatusChanged!: Subject<string>;
  @Input() editorMode: boolean = false;
  @Output() elementSelected = new EventEmitter<TableChildOverlay>();
  @ViewChild('childComponent') childComponent!: ElementComponent;

  isSelected: boolean = false;

  constructor(private cdr: ChangeDetectorRef) { }

  setSelected(newValue: boolean): void {
    this.isSelected = newValue;
    this.cdr.detectChanges();
  }
}
