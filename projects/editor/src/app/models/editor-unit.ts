import { Unit, UnitProperties } from 'common/models/unit';
import { UIElement } from 'common/models/elements/element';
import { AbstractIDService } from 'common/models/id-interfaces';
import { EditorPage } from 'editor/src/app/models/editor-page';

export class EditorUnit extends Unit {
  override pages!: EditorPage[];

  // eslint-disable-next-line class-methods-use-this
  protected override createPages(unit?: UnitProperties, idService?: AbstractIDService): EditorPage[] {
    return unit?.pages.map(page => new EditorPage(page, idService)) ||
        [new EditorPage(undefined, idService)];
  }

  deleteElements(elements: UIElement[]): UIElement[] {
    return this.pages.map(page => page.deleteElements(elements)).flat();
  }
}
