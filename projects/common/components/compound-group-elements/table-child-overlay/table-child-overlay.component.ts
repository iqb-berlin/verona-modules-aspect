import {
  ChangeDetectorRef, Component, ComponentRef, EventEmitter, Input, OnInit, Output, ViewChild, ViewContainerRef
} from '@angular/core';
import { UIElement } from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { TextFieldComponent } from 'common/components/text-input-group-elements/text-field/text-field.component';
import { CheckboxComponent } from 'common/components/input-group-elements/checkbox/checkbox.component';
import { UntypedFormGroup } from '@angular/forms';
import { DropListComponent } from 'common/components/input-group-elements/drop-list/drop-list.component';
import { AudioComponent } from 'common/components/media-player-group-elements/audio/audio.component';
import { Subject } from 'rxjs';
import { TextComponent } from 'common/components/text-group-elements/text/text.component';
import { TextAreaComponent } from 'common/components/text-input-group-elements/text-area/text-area.component';
import { ImageComponent } from 'common/components/interactive-group-elements/image/image.component';
import { UIElementType } from 'common/models/ui-element-interfaces';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'aspect-table-child-overlay',
  standalone: false,
  templateUrl: './table-child-overlay.component.html',
  styleUrls: ['./table-child-overlay.component.scss']
})
export class TableChildOverlay implements OnInit {
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

  ngOnInit(): void { }

  setSelected(newValue: boolean): void {
    this.isSelected = newValue;
    this.cdr.detectChanges();
  }
}
