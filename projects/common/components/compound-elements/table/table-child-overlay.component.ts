import {
  ChangeDetectorRef, Component, ComponentRef, EventEmitter, Input, OnInit, Output, ViewChild, ViewContainerRef
} from '@angular/core';
import { UIElement } from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { TextFieldComponent } from 'common/components/input-elements/text-field.component';
import { CheckboxComponent } from 'common/components/input-elements/checkbox.component';
import { UntypedFormGroup } from '@angular/forms';
import { DropListComponent } from 'common/components/input-elements/drop-list/drop-list.component';
import { AudioComponent } from 'common/components/media-elements/audio.component';
import { Subject } from 'rxjs';
import { TextComponent } from 'common/components/text/text.component';
import { TextAreaComponent } from 'common/components/input-elements/text-area.component';
import { ImageComponent } from 'common/components/media-elements/image.component';
import { UIElementType } from 'common/interfaces';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'aspect-table-child-overlay',
  standalone: false,
  template: `
  <div class="wrapper"
       [class.drop-list-padding]="element.type === 'drop-list'"
       [style.border]="isSelected ? 'purple solid 1px' : ''"
       (click)="elementSelected.emit(this); $event.stopPropagation();">
    <aspect-text *ngIf="element.type === 'text'" #childComponent
                 [elementModel]="$any(element)"
                 [savedText]="savedTexts ? savedTexts[element.id] : ''">
    </aspect-text>
    <aspect-text-field *ngIf="element.type === 'text-field'" #childComponent
                       [elementModel]="$any(element)"
                       [parentForm]="parentForm"
                       [tableMode]="true">
    </aspect-text-field>
    <aspect-text-area *ngIf="element.type === 'text-area'" #childComponent
                      [elementModel]="$any(element)"
                      [parentForm]="parentForm"
                      [tableMode]="true">
    </aspect-text-area>
    <aspect-checkbox *ngIf="element.type === 'checkbox'" #childComponent
                     [elementModel]="$any(element)"
                     [parentForm]="parentForm"
                     [tableMode]="true">
    </aspect-checkbox>
    <aspect-drop-list *ngIf="element.type === 'drop-list'" #childComponent
                      [elementModel]="$any(element)"
                      [parentForm]="parentForm"
                      [clozeContext]="true">
    </aspect-drop-list>
    <aspect-image *ngIf="element.type === 'image'" #childComponent
                  [elementModel]="$any(element)">
    </aspect-image>
    <aspect-audio *ngIf="element.type === 'audio'" #childComponent
                  [elementModel]="$any(element)"
                  [savedPlaybackTime]="savedPlaybackTimes ? savedPlaybackTimes[element.id] : 0"
                  [actualPlayingId]="actualPlayingId"
                  [mediaStatusChanged]="mediaStatusChanged">
    </aspect-audio>
  </div>
`,
  styles: `
  .wrapper {width: 100%; height: 100%; box-sizing: border-box;}
  .drop-list-padding {padding: 2px;}
  :host ::ng-deep aspect-text-field {width: 100%; height: 100%;}
  :host ::ng-deep aspect-text-area {width: 100%; height: 100%;}
  :host ::ng-deep aspect-audio .control-bar {height: 100%; margin-top: 0; justify-content: center;}
  :host ::ng-deep aspect-audio .status-bar {display: none;}
  :host ::ng-deep aspect-audio .control-bar {background-color: unset;}
  :host ::ng-deep aspect-audio .control-bar > button {background-color: var(--background-color);}
  :host ::ng-deep aspect-audio .control-bar button mat-icon {margin: 0;}
  :host ::ng-deep aspect-text .text-container {
    height: 100%; display: flex; flex-direction: column; justify-content: center; padding-left: 8px; padding-right: 8px;
  }
`
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

  ngOnInit(): void {
    if (!this.parentForm && this.childComponent) {
      this.childComponent.elementRef.nativeElement.style.pointerEvents = 'none';
    }
  }

  setSelected(newValue: boolean): void {
    this.isSelected = newValue;
    this.cdr.detectChanges();
  }
}
