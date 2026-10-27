import {
  Component, ElementRef, EventEmitter, Input, Output, QueryList, ViewChildren
} from '@angular/core';
import { CompoundElementComponent } from 'common/directives/compound-element.directive';
import { ElementComponent } from 'common/directives/element-component.directive';
import { ClozeElement } from 'common/models/elements/cloze';
import {
  ClozeChildOverlayComponent
} from 'common/components/cloze-child-overlay/cloze-child-overlay.component';

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

  /** The node types the template draws at the top level; any other it leaves out. */
  private static readonly renderedNodes = ['paragraph', 'heading', 'bulletList', 'orderedList', 'blockquote',
    'blockImage'];

  constructor(public elementRef: ElementRef) {
    super(elementRef);
  }

  /**
   * The template draws a block image without its float, so a leading one always takes the first line. A
   * document without content is drawn empty, as `ModelNormalizer` lets it through.
   */
  static override startsWithText(element: ClozeElement): boolean {
    const first = (element.document.content ?? [])
      .find(node => ClozeComponent.renderedNodes.includes(node.type));
    return !!first && first.type !== 'blockImage';
  }

  getFormElementChildrenComponents(): ElementComponent[] {
    return this.compoundChildren.map((child: ClozeChildOverlayComponent) => child.childComponent);
  }
}
