import {
  Component, ElementRef, EventEmitter, Input, Output, QueryList, ViewChildren
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CompoundElementComponent } from 'common/directives/compound-element.directive';
import { ElementComponent } from 'common/directives/element-component.directive';
import { ClozeElement } from 'common/models/elements/compound-elements/cloze/cloze';
import {
  ClozeChildOverlayComponent
} from '../cloze-child-overlay/cloze-child-overlay.component';

// TODO background color implementieren
@Component({
  selector: 'aspect-cloze',
  templateUrl: './cloze.component.html',
  styleUrls: ['./cloze.component.scss'],
  standalone: false
})
export class ClozeComponent extends CompoundElementComponent {
  @Input() elementModel!: ClozeElement;
  @Output() childElementSelected = new EventEmitter<ClozeChildOverlayComponent>();
  @ViewChildren(ClozeChildOverlayComponent) compoundChildren!: QueryList<ClozeChildOverlayComponent>;

  protected readonly ClozeElement = ClozeElement;
  editorMode: boolean = false;

  constructor(public elementRef: ElementRef, public domSanitizer: DomSanitizer) {
    super(elementRef);
  }

  getFormElementChildrenComponents(): ElementComponent[] {
    return this.compoundChildren.map((child: ClozeChildOverlayComponent) => child.childComponent);
  }
}
